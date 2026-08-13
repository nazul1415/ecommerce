package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	"ecommerce-api/internal/domain"
)

type OrderHandler struct {
	service domain.OrderService
}

func NewOrderHandler(service domain.OrderService) *OrderHandler {
	return &OrderHandler{service: service}
}

type checkoutRequest struct {
	Items []domain.CheckoutItem `json:"items"`
}

func (h *OrderHandler) Checkout(w http.ResponseWriter, r *http.Request) {
	var req checkoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	order, err := h.service.Checkout(r.Context(), req.Items)
	if err != nil {
		if errors.Is(err, domain.ErrEmptyCheckout) || errors.Is(err, domain.ErrInvalidQuantity) {
			respondWithError(w, http.StatusBadRequest, err.Error())
			return
		}
		if errors.Is(err, domain.ErrProductNotFound) {
			respondWithError(w, http.StatusNotFound, err.Error())
			return
		}
		if errors.Is(err, domain.ErrInsufficientStock) {
			respondWithError(w, http.StatusConflict, err.Error())
			return
		}
		respondWithError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	respondWithJSON(w, http.StatusCreated, order)
}
