export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  weight_kg: number;
}

export interface ProductListResponse {
  products: Product[];
  total_items: number;
  total_pages: number;
  current_page: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CheckoutItem {
  product_id: number;
  quantity: number;
}

export interface CheckoutPayload {
  items: CheckoutItem[];
  customer_name?: string;
  customer_email?: string;
  customer_address?: string;
}

export interface OrderResponse {
  id: number;
  total: number;
  created_at: string;
  items: {
    product_id: number;
    quantity: number;
  }[];
}
