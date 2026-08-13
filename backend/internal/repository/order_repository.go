package repository

import (
	"context"
	"database/sql"
	"errors"
	"sort"
	"time"

	"ecommerce-api/internal/domain"
	"github.com/jmoiron/sqlx"
)

type postgresOrderRepository struct {
	db *sqlx.DB
}

func NewPostgresOrderRepository(db *sqlx.DB) domain.OrderRepository {
	return &postgresOrderRepository{db: db}
}

func (r *postgresOrderRepository) Checkout(ctx context.Context, items []domain.CheckoutItem) (*domain.Order, error) {
	if len(items) == 0 {
		return nil, domain.ErrEmptyCheckout
	}

	itemMap := make(map[int64]int)
	var productIDs []int64
	for _, item := range items {
		if item.Quantity <= 0 {
			return nil, domain.ErrInvalidQuantity
		}
		if _, exists := itemMap[item.ProductID]; exists {
			itemMap[item.ProductID] += item.Quantity
		} else {
			itemMap[item.ProductID] = item.Quantity
			productIDs = append(productIDs, item.ProductID)
		}
	}

	sort.Slice(productIDs, func(i, j int) bool {
		return productIDs[i] < productIDs[j]
	})

	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	now := time.Now()
	var total float64
	productPrices := make(map[int64]float64)

	for _, pid := range productIDs {
		var currentStock int
		var price float64
		query := `SELECT stock, price FROM products WHERE id = $1 FOR UPDATE`
		err := tx.QueryRowContext(ctx, query, pid).Scan(&currentStock, &price)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				return nil, domain.ErrProductNotFound
			}
			return nil, err
		}

		reqQty := itemMap[pid]
		if currentStock < reqQty {
			return nil, domain.ErrInsufficientStock
		}

		productPrices[pid] = price
		total += price * float64(reqQty)

		updateQuery := `UPDATE products SET stock = stock - $1, updated_at = $2 WHERE id = $3`
		_, err = tx.ExecContext(ctx, updateQuery, reqQty, now, pid)
		if err != nil {
			return nil, err
		}
	}

	var orderID int64
	orderQuery := `INSERT INTO orders (total, created_at) VALUES ($1, $2) RETURNING id, created_at`
	err = tx.QueryRowContext(ctx, orderQuery, total, now).Scan(&orderID, &now)
	if err != nil {
		return nil, err
	}

	for _, pid := range productIDs {
		qty := itemMap[pid]
		price := productPrices[pid]
		itemQuery := `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)`
		_, err = tx.ExecContext(ctx, itemQuery, orderID, pid, qty, price)
		if err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return &domain.Order{
		ID:        orderID,
		Total:     total,
		CreatedAt: now,
		Items:     items,
	}, nil
}
