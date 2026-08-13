import { ProductListResponse, Product, CheckoutPayload, OrderResponse } from '@/types';

function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    // Código ejecutándose en el Navegador (Client-side)
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
  }
  // Código ejecutándose en el Servidor de Next.js dentro de Docker (SSR)
  return process.env.API_URL_SERVER || process.env.NEXT_PUBLIC_API_URL || 'http://backend:8080/api/v1';
}

export async function getProducts(
  search?: string,
  page: number = 1,
  limit: number = 12
): Promise<ProductListResponse> {
  const baseUrl = getApiUrl();
  const url = new URL(`${baseUrl}/products`);
  
  if (search) {
    url.searchParams.set('search', search);
  }
  url.searchParams.set('page', page.toString());
  url.searchParams.set('limit', limit.toString());

  const response = await fetch(url.toString(), {
    next: { revalidate: 60 }, // Cache and revalidate every 60 seconds (nice Next.js optimization)
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }

  return response.json();
}

export async function getProductById(id: number): Promise<Product> {
  const baseUrl = getApiUrl();
  const response = await fetch(`${baseUrl}/products/${id}`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch product by id ${id}: ${response.statusText}`);
  }

  return response.json();
}

export async function checkoutCart(payload: CheckoutPayload): Promise<OrderResponse> {
  const baseUrl = getApiUrl();
  try {
    const response = await fetch(`${baseUrl}/orders/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: payload.items,
      }),
    });

    if (response.status === 400 || response.status === 409) {
      const errorData = await response.json().catch(() => ({}));
      const msg = (errorData.message || errorData.error || '').toLowerCase();
      if (msg.includes('stock') || msg.includes('insufficient') || msg.includes('insuficiente')) {
        throw new Error('ErrInsufficientStock');
      }
      throw new Error(errorData.message || 'Error validating order');
    }

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }

    return response.json();
  } catch (error: unknown) {
    // If it's the specific stock error we raised, re-throw it
    if (error instanceof Error) {
      if (error.message === 'ErrInsufficientStock') {
        throw error;
      }
    }
    
    // Check if the server is offline/unreachable
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn('API offline: Simulating checkout for prototype...');
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id: Math.floor(1 + Math.random() * 999),
            total: payload.items.reduce((sum, item) => sum + item.quantity * 25, 0), // mock price calculation
            created_at: new Date().toISOString(),
            items: payload.items,
          });
        }, 1000);
      });
    }

    throw error;
  }
}
