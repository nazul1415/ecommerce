package main

import (
	"log"
	"net/http"
	"os"

	"ecommerce-api/internal/handler"
	"ecommerce-api/internal/repository"
	"ecommerce-api/internal/service"

	"github.com/go-chi/chi/v5"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = os.Getenv("DSN")
	}
	if dsn == "" {
		dsn = "postgres://postgres:my_password@localhost:5432/postgres?sslmode=disable"
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	db, err := repository.NewPostgresDB(dsn)
	if err != nil {
		log.Fatalf("failed to connect to postgres: %v", err)
	}
	defer db.Close()

	productRepo := repository.NewPostgresProductRepository(db)
	orderRepo := repository.NewPostgresOrderRepository(db)

	productService := service.NewProductService(productRepo)
	orderService := service.NewOrderService(orderRepo)

	productHandler := handler.NewProductHandler(productService)
	orderHandler := handler.NewOrderHandler(orderService)

	r := chi.NewRouter()

	r.Use(handler.Recovery)
	r.Use(handler.CORS)
	r.Use(handler.Logger)

	r.Route("/api/v1", func(r chi.Router) {
		r.Route("/products", func(r chi.Router) {
			r.Post("/", productHandler.Create)
			r.Get("/", productHandler.List)
			r.Post("/import", productHandler.Import)
			r.Get("/{id}", productHandler.GetByID)
			r.Put("/{id}", productHandler.Update)
			r.Delete("/{id}", productHandler.Delete)
		})

		r.Route("/orders", func(r chi.Router) {
			r.Post("/checkout", orderHandler.Checkout)
		})
	})

	log.Printf("Server listening on port %s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("server stopped with error: %v", err)
	}
}
