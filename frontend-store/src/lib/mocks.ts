import { Product } from '@/types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    sku: 'GOPH-001',
    name: 'Classic Gopher Plushie',
    description: 'The adorable and classic Gopher plushie with soft fur and programmer glasses, perfect for decorating your workspace desk and accompanying you during code debugging sessions.',
    category: 'Plushies',
    price: 25.00,
    stock: 50,
    weight_kg: 0.3
  },
  {
    id: 2,
    sku: 'NEXT-TSHIRT',
    name: 'Next.js T-Shirt',
    description: 'High-quality cotton t-shirt with embroidered Next.js logo. Comfortable, cool, and ideal for everyday wear. Made with sustainable materials.',
    category: 'Apparel',
    price: 35.00,
    stock: 20,
    weight_kg: 0.2
  },
  {
    id: 3,
    sku: 'GOPH-MUG',
    name: 'Gopher Coffee Mug',
    description: 'High-quality ceramic mug, microwave and dishwasher safe. Features a beautiful illustration of Gopher coding in Go with a steaming mug.',
    category: 'Accessories',
    price: 15.00,
    stock: 15,
    weight_kg: 0.4
  },
  {
    id: 4,
    sku: 'DECAL-PACK',
    name: 'Go & Next.js Decal Pack',
    description: 'Pack of 10 ultra-durable and waterproof vinyl stickers with various designs of Go, Gopher, Tailwind CSS, and Next.js. Perfect for your laptop.',
    category: 'Accessories',
    price: 5.00,
    stock: 100,
    weight_kg: 0.05
  },
  {
    id: 5,
    sku: 'BAG-LAPTOP',
    name: 'Gopher Laptop Backpack',
    description: 'Ergonomic and waterproof backpack with padded compartments for laptops up to 16 inches, multiple pockets, and an external USB port for power banks.',
    category: 'Gear',
    price: 55.00,
    stock: 5,
    weight_kg: 0.8
  },
  {
    id: 6,
    sku: 'TW-HAT',
    name: 'Tailwind Flat Cap',
    description: 'Flat visor cap with 3D embroidery of Tailwind CSS. Highly durable strapback adjustment system, made of acrylic and wool.',
    category: 'Apparel',
    price: 22.50,
    stock: 0,
    weight_kg: 0.15
  }
];
