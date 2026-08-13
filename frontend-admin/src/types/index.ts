export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  weight_kg: number;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  limit: number;
  page: number;
}

export interface RowErrorDetail {
  line: number;
  sku?: string;
  reason: string;
}

export interface ImportResult {
  imported_count: number;
  failed_count: number;
  errors?: RowErrorDetail[];
}

export interface ImportApiResponse {
  message: string;
  data: ImportResult;
}

export type ImportAPIResponse = ImportApiResponse;

export interface APIResponse<T> {
  message?: string;
  data: T;
}
