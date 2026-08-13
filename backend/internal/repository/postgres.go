package repository

import (
	"context"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/jmoiron/sqlx"
)

func NewPostgresDB(dsn string) (*sqlx.DB, error) {
	db, err := sqlx.Open("pgx", dsn)
	if err != nil {
		return nil, err
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)
	db.SetConnMaxIdleTime(2 * time.Minute)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		return nil, err
	}

	if err := InitSchema(db); err != nil {
		return nil, err
	}

	return db, nil
}

func InitSchema(db *sqlx.DB) error {
	schema := `
	CREATE TABLE IF NOT EXISTS products (
		id BIGSERIAL PRIMARY KEY,
		sku VARCHAR(255) UNIQUE NOT NULL,
		name VARCHAR(255) NOT NULL,
		description TEXT NOT NULL,
		category VARCHAR(255) NOT NULL,
		price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
		stock INT NOT NULL DEFAULT 0,
		weight_kg DECIMAL(12,2) NOT NULL DEFAULT 0.00,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	);

	CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
	CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

	CREATE TABLE IF NOT EXISTS orders (
		id BIGSERIAL PRIMARY KEY,
		total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	);

	CREATE TABLE IF NOT EXISTS order_items (
		id BIGSERIAL PRIMARY KEY,
		order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
		product_id BIGINT NOT NULL REFERENCES products(id),
		quantity INT NOT NULL,
		price DECIMAL(12,2) NOT NULL,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	);

	CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
	`
	_, err := db.Exec(schema)
	return err
}
