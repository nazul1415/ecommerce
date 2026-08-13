import api from './api';
import type { ImportApiResponse, Product, ProductListResponse } from '../types';

/**
 * Servicio para importar un archivo CSV de productos.
 * Envía el archivo al backend usando FormData con la clave 'file'.
 * 
 * @param file Archivo CSV seleccionado por el usuario.
 * @returns Promesa con los resultados de la importación.
 */
export const importCSV = async (file: File): Promise<ImportApiResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<ImportApiResponse>('/products/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * Obtiene la lista de productos paginados con opción de búsqueda.
 * GET /products?page=X&limit=Y&search=Z
 * 
 * @param page Página actual (1-based).
 * @param limit Número de elementos por página.
 * @param search Término de búsqueda para SKU, Nombre o Categoría.
 * @returns Lista paginada de productos.
 */
export const getProducts = async (
  page: number,
  limit: number,
  search: string
): Promise<ProductListResponse> => {
  const response = await api.get<ProductListResponse | { data: ProductListResponse }>('/products', {
    params: {
      page,
      limit,
      search,
    },
  });

  // Extraer el cuerpo de forma tolerante si viene envuelto en un 'data' extra por axios o la API
  if ('data' in response.data && response.data.data && 'products' in response.data.data) {
    return response.data.data;
  }
  return response.data as ProductListResponse;
};

/**
 * Crea un nuevo producto en el catálogo.
 * POST /products
 * 
 * @param product Datos del producto (excluyendo el ID).
 * @returns Producto creado devuelto por la API.
 */
export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  const response = await api.post<Product | { data: Product }>('/products', product);
  
  if ('data' in response.data && response.data.data) {
    return response.data.data;
  }
  return response.data as Product;
};

/**
 * Actualiza parcialmente un producto existente.
 * PUT /products/:id
 * 
 * @param id ID del producto a modificar.
 * @param product Campos modificados.
 * @returns Producto actualizado devuelto por la API.
 */
export const updateProduct = async (
  id: number,
  product: Partial<Product>
): Promise<Product> => {
  const response = await api.put<Product | { data: Product }>(`/products/${id}`, product);
  
  if ('data' in response.data && response.data.data) {
    return response.data.data;
  }
  return response.data as Product;
};

/**
 * Elimina un producto del catálogo de forma permanente.
 * DELETE /products/:id
 * 
 * @param id ID del producto a eliminar.
 */
export const deleteProduct = async (id: number): Promise<void> => {
  await api.delete(`/products/${id}`);
};
