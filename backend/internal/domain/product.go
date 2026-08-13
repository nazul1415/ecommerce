package domain

import (
	"context"
	"time"
)

type Product struct {
	ID          int64     `json:"id" db:"id"`
	SKU         string    `json:"sku" db:"sku"`
	Name        string    `json:"name" db:"name"`
	Description string    `json:"description" db:"description"`
	Category    string    `json:"category" db:"category"`
	Price       float64   `json:"price" db:"price"`
	Stock       int       `json:"stock" db:"stock"`
	WeightKg    float64   `json:"weight_kg" db:"weight_kg"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

type ProductRepository interface {
	Create(ctx context.Context, product *Product) error
	GetByID(ctx context.Context, id int64) (*Product, error)
	GetBySKU(ctx context.Context, sku string) (*Product, error)
	Update(ctx context.Context, product *Product) error
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, search, category string, page, limit int) ([]Product, int, error)
	ImportBulk(ctx context.Context, products []Product) error
}

type ProductService interface {
	Create(ctx context.Context, product *Product) error
	GetByID(ctx context.Context, id int64) (*Product, error)
	Update(ctx context.Context, id int64, product *Product) error
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, search, category string, page, limit int) ([]Product, int, error)
	ImportCSV(ctx context.Context, stream chan []string) (ImportResult, error)
}
