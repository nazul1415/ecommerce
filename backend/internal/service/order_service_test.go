package service

import (
	"context"
	"testing"

	"ecommerce-api/internal/domain"
)

type mockOrderRepository struct {
	items []domain.CheckoutItem
	err   error
}

func (m *mockOrderRepository) Checkout(ctx context.Context, items []domain.CheckoutItem) (*domain.Order, error) {
	if m.err != nil {
		return nil, m.err
	}
	m.items = items
	return &domain.Order{
		ID:    100,
		Total: 25.50,
	}, nil
}

func TestCheckoutService(t *testing.T) {
	repo := &mockOrderRepository{}
	svc := NewOrderService(repo)

	items := []domain.CheckoutItem{
		{ProductID: 1, Quantity: 2},
		{ProductID: 2, Quantity: 1},
	}

	order, err := svc.Checkout(context.Background(), items)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if order.ID != 100 {
		t.Errorf("expected order ID 100, got %d", order.ID)
	}

	if order.Total != 25.50 {
		t.Errorf("expected total 25.50, got %f", order.Total)
	}

	if len(repo.items) != 2 {
		t.Errorf("expected repository to receive 2 items, got %d", len(repo.items))
	}
}

func TestCheckoutServiceInvalidQuantity(t *testing.T) {
	repo := &mockOrderRepository{}
	svc := NewOrderService(repo)

	items := []domain.CheckoutItem{
		{ProductID: 1, Quantity: -1},
	}

	_, err := svc.Checkout(context.Background(), items)
	if err != domain.ErrInvalidQuantity {
		t.Errorf("expected ErrInvalidQuantity, got %v", err)
	}
}

func TestCheckoutServiceEmptyItems(t *testing.T) {
	repo := &mockOrderRepository{}
	svc := NewOrderService(repo)

	var items []domain.CheckoutItem

	_, err := svc.Checkout(context.Background(), items)
	if err != domain.ErrEmptyCheckout {
		t.Errorf("expected ErrEmptyCheckout, got %v", err)
	}
}
