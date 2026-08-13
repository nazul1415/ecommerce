package service

import (
	"context"
	"fmt"
	"log"
	"regexp"
	"strconv"
	"strings"

	"ecommerce-api/internal/domain"
)

type productService struct {
	repo domain.ProductRepository
}

func NewProductService(repo domain.ProductRepository) domain.ProductService {
	return &productService{repo: repo}
}

func (s *productService) Create(ctx context.Context, product *domain.Product) error {
	if err := s.validateProduct(product); err != nil {
		return err
	}
	return s.repo.Create(ctx, product)
}

func (s *productService) GetByID(ctx context.Context, id int64) (*domain.Product, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *productService) Update(ctx context.Context, id int64, product *domain.Product) error {
	if err := s.validateProduct(product); err != nil {
		return err
	}
	product.ID = id
	return s.repo.Update(ctx, product)
}

func (s *productService) Delete(ctx context.Context, id int64) error {
	return s.repo.Delete(ctx, id)
}

func (s *productService) List(ctx context.Context, search, category string, page, limit int) ([]domain.Product, int, error) {
	return s.repo.List(ctx, search, category, page, limit)
}

func (s *productService) ImportCSV(ctx context.Context, stream chan []string) (domain.ImportResult, error) {
	var (
		result     domain.ImportResult
		batch      []domain.Product
		seenSKUs   = make(map[string]int)
		skuRegex   = regexp.MustCompile(`^[A-Za-z0-9-_]+$`)
		lineNumber = 1 // header
	)

	const batchSize = 100

	for record := range stream {
		lineNumber++

		if len(record) < 7 {
			result.FailedCount++
			result.Errors = append(result.Errors, domain.RowErrorDetail{
				Line:   lineNumber,
				Reason: "Número de columnas insuficiente",
			})
			continue
		}

		name := strings.TrimSpace(record[0])
		sku := strings.TrimSpace(record[1])
		description := strings.TrimSpace(record[2])
		category := strings.TrimSpace(record[3])
		priceStr := strings.TrimSpace(record[4])
		stockStr := strings.TrimSpace(record[5])
		weightStr := strings.TrimSpace(record[6])

		// 1. validate headers
		if sku == "" || strings.EqualFold(sku, "sku") || name == "" {
			result.FailedCount++
			result.Errors = append(result.Errors, domain.RowErrorDetail{
				Line:   lineNumber,
				SKU:    sku,
				Reason: "SKU o Nombre vacíos",
			})
			continue
		}

		// 2. duplicated on memory
		if firstLine, exists := seenSKUs[sku]; exists {
			log.Printf("[IMPORT WARNING] Línea %d: SKU '%s' duplicado (visto por primera vez en línea %d). Omitiendo.",
				lineNumber, sku, firstLine)

			result.FailedCount++
			result.Errors = append(result.Errors, domain.RowErrorDetail{
				Line:   lineNumber,
				SKU:    sku,
				Reason: fmt.Sprintf("SKU duplicado en la misma carga (visto primero en línea %d)", firstLine),
			})
			continue
		}

		if !skuRegex.MatchString(sku) {
			result.FailedCount++
			result.Errors = append(result.Errors, domain.RowErrorDetail{
				Line:   lineNumber,
				SKU:    sku,
				Reason: "Formato de SKU inválido",
			})
			continue
		}

		// --- parse ---
		priceStrClean := strings.ReplaceAll(priceStr, "$", "")
		var price float64
		var err error

		if strings.EqualFold(priceStrClean, "free") {
			price = 0.0
		} else {
			price, err = strconv.ParseFloat(priceStrClean, 64)
			if err != nil || price < 0 {
				result.FailedCount++
				result.Errors = append(result.Errors, domain.RowErrorDetail{
					Line:   lineNumber,
					SKU:    sku,
					Reason: fmt.Sprintf("Precio inválido: %s", priceStr),
				})
				continue
			}
		}

		stockFloat, err := strconv.ParseFloat(stockStr, 64)
		if err != nil || stockFloat < 0 {
			result.FailedCount++
			result.Errors = append(result.Errors, domain.RowErrorDetail{
				Line:   lineNumber,
				SKU:    sku,
				Reason: fmt.Sprintf("Stock inválido: %s", stockStr),
			})
			continue
		}

		weight, err := strconv.ParseFloat(weightStr, 64)
		if err != nil || weight < 0 {
			result.FailedCount++
			result.Errors = append(result.Errors, domain.RowErrorDetail{
				Line:   lineNumber,
				SKU:    sku,
				Reason: fmt.Sprintf("Peso inválido: %s", weightStr),
			})
			continue
		}

		// SKU successfull
		seenSKUs[sku] = lineNumber

		batch = append(batch, domain.Product{
			SKU:         sku,
			Name:        name,
			Description: description,
			Category:    category,
			Price:       price,
			Stock:       int(stockFloat),
			WeightKg:    weight,
		})

		if len(batch) >= batchSize {
			if err := s.repo.ImportBulk(ctx, batch); err != nil {
				log.Printf("[ERROR] Fallo al insertar lote de %d productos: %v", len(batch), err)
				result.FailedCount += len(batch)
			} else {
				result.ImportedCount += len(batch)
			}
			batch = batch[:0]
		}
	}

	// Proccess chunk
	if len(batch) > 0 {
		if err := s.repo.ImportBulk(ctx, batch); err != nil {
			log.Printf("[ERROR] Fallo al insertar lote remanente de %d productos: %v", len(batch), err)
			result.FailedCount += len(batch)
		} else {
			result.ImportedCount += len(batch)
		}
	}

	return result, nil
}

func (s *productService) validateProduct(p *domain.Product) error {
	p.SKU = strings.TrimSpace(p.SKU)
	p.Name = strings.TrimSpace(p.Name)
	p.Description = strings.TrimSpace(p.Description)
	p.Category = strings.TrimSpace(p.Category)

	if p.SKU == "" || p.Name == "" {
		return domain.ErrInvalidProduct
	}

	skuRegex := regexp.MustCompile(`^[A-Za-z0-9-_]+$`)
	if !skuRegex.MatchString(p.SKU) {
		return domain.ErrInvalidProduct
	}

	if p.Price < 0 || p.Stock < 0 || p.WeightKg < 0 {
		return domain.ErrInvalidProduct
	}

	return nil
}
