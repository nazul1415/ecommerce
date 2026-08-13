import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/api';
import { MOCK_PRODUCTS } from '@/lib/mocks';
import ProductDetail from '@/components/ProductDetail';
import { Product } from '@/types';

interface Props {
  params: { id: string };
}

// Generate dynamic metadata for search engine optimization (SEO)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const productId = parseInt(params.id, 10);
  if (isNaN(productId)) {
    return {
      title: 'Product not found - GopherStore',
    };
  }

  try {
    const product = await getProductById(productId);
    return {
      title: `${product.name} | GopherStore`,
      description: product.description.substring(0, 160),
    };
  } catch {
    // Attempt fallback lookup for local SEO mock values
    const fallbackProduct = MOCK_PRODUCTS.find((p) => p.id === productId);
    if (fallbackProduct) {
      return {
        title: `${fallbackProduct.name} | GopherStore`,
        description: fallbackProduct.description.substring(0, 160),
      };
    }
    return {
      title: 'Product not found - GopherStore',
    };
  }
}

export default async function ProductPage({ params }: Props) {
  const productId = parseInt(params.id, 10);
  if (isNaN(productId)) {
    return notFound();
  }

  let product: Product | null = null;
  let isFallback = false;

  try {
    product = await getProductById(productId);
  } catch {
    console.warn(`Product API failed for ID ${productId}, checking fallback store...`);
    // Try to load from mock data
    const foundMock = MOCK_PRODUCTS.find((p) => p.id === productId);
    if (foundMock) {
      product = foundMock;
      isFallback = true;
    }
  }

  // If the product is not found in the live backend nor the backup catalog, render 404
  if (!product) {
    return notFound();
  }

  return (
    <ProductDetail product={product} isFallback={isFallback} />
  );
}
