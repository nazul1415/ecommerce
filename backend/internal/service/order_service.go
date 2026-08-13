package service

import (
	"context"

	"ecommerce-api/internal/domain"
)

type orderService struct {
	repo domain.OrderRepository
}

func NewOrderService(repo domain.OrderRepository) domain.OrderService {
	return &orderService{repo: repo}
}

func (s *orderService) Checkout(ctx context.Context, items []domain.CheckoutItem) (*domain.Order, error) {
	if len(items) == 0 {
		return nil, domain.ErrEmptyCheckout
	}

	for _, item := range items {
		if item.Quantity <= 0 {
			return nil, domain.ErrInvalidQuantity
		}
	}

	return s.repo.Checkout(ctx, items)
}
