'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { Search, ShoppingCart, Info, Check, SlidersHorizontal } from 'lucide-react';

interface ProductCatalogProps {
  initialProducts: Product[];
  isFallback: boolean;
}

export default function ProductCatalog({ initialProducts, isFallback }: ProductCatalogProps) {
  const { addToCart } = useCart();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default'); // 'default', 'price-asc', 'price-desc', 'name-asc'
  const [addedProductId, setAddedProductId] = useState<number | null>(null);

  // Get all unique categories dynamically
  const categories = useMemo(() => {
    const cats = initialProducts.map((p) => p.category);
    return ['All', ...Array.from(new Set(cats))];
  }, [initialProducts]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...initialProducts];

    // Search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.sku.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [initialProducts, searchTerm, selectedCategory, sortBy]);

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    setAddedProductId(product.id);
    setTimeout(() => {
      setAddedProductId(null);
    }, 1500); // Reset animation state after 1.5s
  };

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Fallback Banner Alert if using Mock Data */}
      {isFallback && (
        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 shadow-sm flex items-start gap-3">
          <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-amber-800 text-sm sm:text-base">Backup Catalog Active</h3>
            <p className="text-xs sm:text-sm text-amber-700 mt-1">
              Could not connect to the Go API at <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-amber-800">http://localhost:8080/api/v1</code>. 
              Showing demo products so you can explore the store in a fully interactive way.
            </p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="mb-10 text-center md:text-left md:flex md:items-end md:justify-between border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Product Catalog
          </h1>
          <p className="mt-3 text-lg text-gray-500 max-w-2xl">
            Welcome to our store. Filter, search, and add your favorite items to the shopping cart in real time.
          </p>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="mb-8 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-grow">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, description, category, or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 md:w-64">
            <SlidersHorizontal className="h-4 w-4 text-gray-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-3 text-sm text-gray-700 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
            >
              <option value="default">Sort by default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A - Z</option>
            </select>
          </div>
        </div>

        {/* Category Filter Tags */}
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Categories</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition border ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-100'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6 flex justify-between items-center text-sm text-gray-500">
        <p>
          Showing <span className="font-semibold text-gray-900">{filteredAndSortedProducts.length}</span>{' '}
          {filteredAndSortedProducts.length === 1 ? 'product' : 'products'}
        </p>
      </div>

      {/* Product Grid */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 p-8">
          <p className="text-lg font-semibold text-gray-900">No products found</p>
          <p className="text-sm text-gray-500 mt-1">Try adjusting your search terms or filters.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
              setSortBy('default');
            }}
            className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {filteredAndSortedProducts.map((product) => {
            const isOutOfStock = product.stock === 0;
            const isLowStock = product.stock > 0 && product.stock <= 5;
            const isAddingThis = addedProductId === product.id;

            return (
              <article
                key={product.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition duration-200 hover:-translate-y-0.5"
              >
                {/* Visual placeholder with category-styled background */}
                <Link
                  href={`/products/${product.id}`}
                  className="relative aspect-video w-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center overflow-hidden border-b border-gray-100 hover:opacity-90 transition block"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/30 via-white/0 to-white/0" />
                  <span className="text-4xl filter drop-shadow group-hover:scale-110 transition duration-300">
                    {product.category === 'Plushies' ? '🧸' : 
                     product.category === 'Apparel' ? '👕' : 
                     product.category === 'Accessories' ? '☕' : '📦'}
                  </span>
                  
                  {/* Category Badge on Image */}
                  <span className="absolute top-3 left-3 inline-block px-2.5 py-1 text-[10px] font-bold tracking-wider text-indigo-700 bg-white/90 backdrop-blur-sm rounded-full shadow-sm border border-indigo-50 uppercase">
                    {product.category}
                  </span>
                </Link>

                {/* Content */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition line-clamp-1">
                      <Link href={`/products/${product.id}`}>{product.name}</Link>
                    </h2>
                  </div>
                  
                  <p className="text-xs text-gray-400 font-medium mt-1">SKU: {product.sku}</p>

                  <p className="mt-2 text-sm text-gray-500 line-clamp-2 flex-grow">
                    {product.description}
                  </p>

                  {/* Weight, Price & Stock Info */}
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Weight:</span>
                      <span className="text-xs font-semibold text-gray-600">{product.weight_kg} kg</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Availability:</span>
                      {isOutOfStock ? (
                        <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/10">
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/10 animate-pulse">
                          Only {product.stock} left!
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">
                          In Stock ({product.stock})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-gray-400">Price:</span>
                      <span className="text-xl font-extrabold text-gray-900">
                        {formatUSD(product.price)}
                      </span>
                    </div>
                  </div>

                  {/* Add To Cart Button */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={isOutOfStock}
                    className={`mt-4 w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold shadow-sm transition duration-150 ${
                      isOutOfStock
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none'
                        : isAddingThis
                        ? 'bg-green-600 text-white border border-green-600'
                        : 'bg-indigo-600 text-white border border-transparent hover:bg-indigo-700 active:scale-[0.98]'
                    }`}
                  >
                    {isAddingThis ? (
                      <>
                        <Check className="h-4 w-4 stroke-[3px]" />
                        <span>Added!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4" />
                        <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}