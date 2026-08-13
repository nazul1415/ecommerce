package domain

import (
	"context"
	"time"
)

type CheckoutItem struct {
	ProductID int64 `json:"product_id" db:"product_id"`
	Quantity  int   `json:"quantity" db:"quantity"`
}

type Order struct {
	ID        int64          `json:"id" db:"id"`
	Total     float64        `json:"total" db:"total"`
	CreatedAt time.Time      `json:"created_at" db:"created_at"`
	Items     []CheckoutItem `json:"items" json:"-"`
}

type OrderRepository interface {
	Checkout(ctx context.Context, items []CheckoutItem) (*Order, error)
}

type OrderService interface {
	Checkout(ctx context.Context, items []CheckoutItem) (*Order, error)
}
