package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"ecommerce-api/internal/domain"
	"github.com/jmoiron/sqlx"
)

type postgresProductRepository struct {
	db *sqlx.DB
}

func NewPostgresProductRepository(db *sqlx.DB) domain.ProductRepository {
	return &postgresProductRepository{db: db}
}

func (r *postgresProductRepository) Create(ctx context.Context, product *domain.Product) error {
	query := `
		INSERT INTO products (sku, name, description, category, price, stock, weight_kg, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, created_at, updated_at`

	now := time.Now()
	err := r.db.QueryRowContext(
		ctx,
		query,
		product.SKU,
		product.Name,
		product.Description,
		product.Category,
		product.Price,
		product.Stock,
		product.WeightKg,
		now,
		now,
	).Scan(&product.ID, &product.CreatedAt, &product.UpdatedAt)

	if err != nil {
		if strings.Contains(err.Error(), "unique constraint") || strings.Contains(err.Error(), "products_sku_key") {
			return domain.ErrProductSKUExists
		}
		return err
	}

	return nil
}

func (r *postgresProductRepository) GetByID(ctx context.Context, id int64) (*domain.Product, error) {
	query := `
		SELECT id, sku, name, description, category, price, stock, weight_kg, created_at, updated_at
		FROM products
		WHERE id = $1`

	var p domain.Product
	err := r.db.GetContext(ctx, &p, query, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, domain.ErrProductNotFound
		}
		return nil, err
	}

	return &p, nil
}

func (r *postgresProductRepository) GetBySKU(ctx context.Context, sku string) (*domain.Product, error) {
	query := `
		SELECT id, sku, name, description, category, price, stock, weight_kg, created_at, updated_at
		FROM products
		WHERE sku = $1`

	var p domain.Product
	err := r.db.GetContext(ctx, &p, query, sku)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, domain.ErrProductNotFound
		}
		return nil, err
	}

	return &p, nil
}

func (r *postgresProductRepository) Update(ctx context.Context, product *domain.Product) error {
	query := `
		UPDATE products
		SET sku = $1, name = $2, description = $3, category = $4, price = $5, stock = $6, weight_kg = $7, updated_at = $8
		WHERE id = $9`

	now := time.Now()
	res, err := r.db.ExecContext(
		ctx,
		query,
		product.SKU,
		product.Name,
		product.Description,
		product.Category,
		product.Price,
		product.Stock,
		product.WeightKg,
		now,
		product.ID,
	)
	if err != nil {
		if strings.Contains(err.Error(), "unique constraint") || strings.Contains(err.Error(), "products_sku_key") {
			return domain.ErrProductSKUExists
		}
		return err
	}

	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return domain.ErrProductNotFound
	}

	product.UpdatedAt = now
	return nil
}

func (r *postgresProductRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM products WHERE id = $1`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}

	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return domain.ErrProductNotFound
	}

	return nil
}

func (r *postgresProductRepository) List(ctx context.Context, search, category string, page, limit int) ([]domain.Product, int, error) {
	var whereClauses []string
	var args []interface{}
	argCount := 1

	if search != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("(name ILIKE $%d OR sku ILIKE $%d OR description ILIKE $%d)", argCount, argCount, argCount))
		args = append(args, "%"+search+"%")
		argCount++
	}

	if category != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("category = $%d", argCount))
		args = append(args, category)
		argCount++
	}

	whereSQL := ""
	if len(whereClauses) > 0 {
		whereSQL = "WHERE " + strings.Join(whereClauses, " AND ")
	}

	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM products %s", whereSQL)
	var total int
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, 0, err
	}

	if limit <= 0 {
		limit = 10
	}
	if page <= 0 {
		page = 1
	}
	offset := (page - 1) * limit

	selectQuery := fmt.Sprintf(`
		SELECT id, sku, name, description, category, price, stock, weight_kg, created_at, updated_at
		FROM products
		%s
		ORDER BY id DESC
		LIMIT $%d OFFSET $%d`, whereSQL, argCount, argCount+1)

	args = append(args, limit, offset)

	var products []domain.Product
	err = r.db.SelectContext(ctx, &products, selectQuery, args...)
	if err != nil {
		return nil, 0, err
	}

	return products, total, nil
}

func (r *postgresProductRepository) ImportBulk(ctx context.Context, products []domain.Product) error {
	if len(products) == 0 {
		return nil
	}

	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	batchSize := 1000
	for i := 0; i < len(products); i += batchSize {
		end := i + batchSize
		if end > len(products) {
			end = len(products)
		}
		batch := products[i:end]

		query, args, err := buildBulkInsertQuery(batch)
		if err != nil {
			return err
		}

		_, err = tx.ExecContext(ctx, query, args...)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func buildBulkInsertQuery(products []domain.Product) (string, []interface{}, error) {
	var valStrings []string
	var args []interface{}
	now := time.Now()

	for i, p := range products {
		offset := i * 9
		valStrings = append(valStrings, fmt.Sprintf(
			"($%d, $%d, $%d, $%d, $%d, $%d, $%d, $%d, $%d)",
			offset+1, offset+2, offset+3, offset+4, offset+5, offset+6, offset+7, offset+8, offset+9,
		))
		args = append(args, p.SKU, p.Name, p.Description, p.Category, p.Price, p.Stock, p.WeightKg, now, now)
	}

	query := fmt.Sprintf(`
		INSERT INTO products (sku, name, description, category, price, stock, weight_kg, created_at, updated_at)
		VALUES %s
		ON CONFLICT (sku) DO UPDATE SET
			name = EXCLUDED.name,
			description = EXCLUDED.description,
			category = EXCLUDED.category,
			price = EXCLUDED.price,
			stock = EXCLUDED.stock,
			weight_kg = EXCLUDED.weight_kg,
			updated_at = EXCLUDED.updated_at`,
		strings.Join(valStrings, ","),
	)

	return query, args, nil
}
