import React from 'react';
import { getProducts } from '@/lib/api';
import ProductCatalog from '@/components/ProductCatalog';
import { Product } from '@/types';
import { MOCK_PRODUCTS } from '@/lib/mocks';

export default async function HomePage() {
  let products: Product[] = [];
  let isFallback = false;

  try {
    const response = await getProducts(undefined, 1, 50);
    products = response.products || [];
    
    // If the API succeeds but returns empty products, we can still fall back or show empty
    if (products.length === 0) {
      products = MOCK_PRODUCTS;
      isFallback = true;
    }
  } catch (error) {
    console.warn('API is unreachable, falling back to mock products.', error);
    products = MOCK_PRODUCTS;
    isFallback = true;
  }

  return (
    <ProductCatalog initialProducts={products} isFallback={isFallback} />
  );
}
