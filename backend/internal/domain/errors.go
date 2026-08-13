package domain

import "errors"

var (
	ErrProductNotFound   = errors.New("product not found")
	ErrProductSKUExists  = errors.New("product SKU already exists")
	ErrInvalidProduct    = errors.New("invalid product data")
	ErrInsufficientStock = errors.New("insufficient stock for one or more products")
	ErrInvalidQuantity   = errors.New("invalid quantity specified")
	ErrEmptyCheckout     = errors.New("checkout items list cannot be empty")
)

type ImportResult struct {
	ImportedCount int              `json:"imported_count"`
	FailedCount   int              `json:"failed_count"`
	Errors        []RowErrorDetail `json:"errors,omitempty"`
}

type RowErrorDetail struct {
	Line   int    `json:"line"`
	SKU    string `json:"sku,omitempty"`
	Reason string `json:"reason"`
}
