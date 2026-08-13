package service

import (
	"context"
	"testing"

	"ecommerce-api/internal/domain"
)

type mockProductRepository struct {
	imported []domain.Product
	err      error
}

func (m *mockProductRepository) Create(ctx context.Context, p *domain.Product) error {
	return nil
}

func (m *mockProductRepository) GetByID(ctx context.Context, id int64) (*domain.Product, error) {
	return nil, nil
}

func (m *mockProductRepository) GetBySKU(ctx context.Context, sku string) (*domain.Product, error) {
	return nil, nil
}

func (m *mockProductRepository) Update(ctx context.Context, p *domain.Product) error {
	return nil
}

func (m *mockProductRepository) Delete(ctx context.Context, id int64) error {
	return nil
}

func (m *mockProductRepository) List(ctx context.Context, s, c string, p, l int) ([]domain.Product, int, error) {
	return nil, 0, nil
}

func (m *mockProductRepository) ImportBulk(ctx context.Context, products []domain.Product) error {
	if m.err != nil {
		return m.err
	}
	m.imported = append(m.imported, products...)
	return nil
}

func TestImportCSV(t *testing.T) {
	repo := &mockProductRepository{}
	svc := NewProductService(repo)

	stream := make(chan []string, 5)
	stream <- []string{"Product 1", "SKU-1", "Desc 1", "Cat 1", "10.50", "100", "1.5"}
	stream <- []string{"Product 2", "SKU-2", "Desc 2", "Cat 2", "20.00", "50", "2.0"}
	stream <- []string{"Product 3", "invalid-sku$", "Desc 3", "Cat 3", "15.00", "30", "0.5"}
	stream <- []string{"Product 4", "SKU-3", "Desc 4", "Cat 4", "-5.00", "10", "1.0"}
	close(stream)

	results, err := svc.ImportCSV(context.Background(), stream)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if results.ImportedCount != 2 {
		t.Errorf("expected 2 imported, got %d", results.ImportedCount)
	}

	if results.FailedCount != 2 {
		t.Errorf("expected 2 failed, got %d", results.FailedCount)
	}

	if len(repo.imported) != 2 {
		t.Errorf("expected repo to have 2 imported items, got %d", len(repo.imported))
	}

	if repo.imported[0].SKU != "SKU-1" || repo.imported[1].SKU != "SKU-2" {
		t.Errorf("imported SKUs mismatch")
	}
}

func TestValidateProduct(t *testing.T) {
	repo := &mockProductRepository{}
	svc := NewProductService(repo).(*productService)

	valid := &domain.Product{
		SKU:      "SKU-123_abc",
		Name:     "Valid Name",
		Price:    10.0,
		Stock:    5,
		WeightKg: 1.2,
	}

	if err := svc.validateProduct(valid); err != nil {
		t.Errorf("expected product to be valid, got: %v", err)
	}

	invalidSKU := &domain.Product{
		SKU:      "SKU invalid",
		Name:     "Name",
		Price:    10.0,
		Stock:    5,
		WeightKg: 1.2,
	}

	if err := svc.validateProduct(invalidSKU); err == nil {
		t.Error("expected error for invalid SKU containing space")
	}

	negativePrice := &domain.Product{
		SKU:      "SKU123",
		Name:     "Name",
		Price:    -1.0,
		Stock:    5,
		WeightKg: 1.2,
	}

	if err := svc.validateProduct(negativePrice); err == nil {
		t.Error("expected error for negative price")
	}
}
