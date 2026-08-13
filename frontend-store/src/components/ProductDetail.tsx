'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { ArrowLeft, ShoppingCart, Check, Info, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  isFallback: boolean;
}

export default function ProductDetail({ product, isFallback }: ProductDetailProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    const maxStock = product.stock !== undefined ? product.stock : 999;
    setQuantity((prev) => Math.min(maxStock, prev + 1));
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Fallback Banner Alert */}
      {isFallback && (
        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 shadow-sm flex items-start gap-3">
          <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-amber-800 text-sm sm:text-base">Active Backup Details</h3>
            <p className="text-xs sm:text-sm text-amber-700 mt-1">
              Could not connect to the Go API. Showing simulated details for {product.name} from our local backup catalog.
            </p>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-2 bg-white rounded-3xl border border-gray-200 p-6 sm:p-10 shadow-sm">
        {/* Left Column: Visual Container */}
        <div className="flex flex-col justify-center items-center aspect-square w-full rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-gray-100 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/30 via-white/0 to-white/0" />
          <span className="text-9xl filter drop-shadow-xl select-none animate-pulse">
            {product.category === 'Plushies' ? '🧸' : 
             product.category === 'Apparel' ? '👕' : 
             product.category === 'Accessories' ? '☕' : '📦'}
          </span>
          <span className="absolute bottom-4 right-4 text-xs font-bold text-indigo-400 bg-white/80 px-2.5 py-1 rounded-full border border-indigo-100 uppercase">
            {product.category}
          </span>
        </div>

        {/* Right Column: Information & Actions */}
        <div className="flex flex-col justify-between">
          <div>
            {/* Category and SKU */}
            <div className="flex items-center gap-3">
              <span className="inline-block px-3 py-1 text-xs font-bold tracking-wider text-indigo-700 bg-indigo-50 rounded-full border border-indigo-100 uppercase">
                {product.category}
              </span>
              <span className="text-xs text-gray-400 font-medium">SKU: {product.sku}</span>
            </div>

            {/* Product Name */}
            <h1 className="mt-4 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
              {product.name}
            </h1>

            {/* Price */}
            <p className="mt-3 text-3xl font-extrabold text-indigo-600">
              {formatUSD(product.price)}
            </p>

            {/* Availability Badge */}
            <div className="mt-4">
              {isOutOfStock ? (
                <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/10">
                  Temporarily out of stock
                </span>
              ) : isLowStock ? (
                <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/10 animate-pulse">
                  Last units! Only {product.stock} available
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">
                  In stock ({product.stock} units available)
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mt-6 border-t border-gray-100 pt-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Product Description</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Specs Grid */}
            <div className="mt-6 border-t border-gray-100 pt-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Specifications</h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                <div className="border-b border-gray-50 pb-2 flex justify-between sm:flex-col sm:border-0 sm:pb-0">
                  <dt className="text-xs text-gray-400 font-medium">Product weight</dt>
                  <dd className="text-sm font-bold text-gray-800">{product.weight_kg} kg</dd>
                </div>
                <div className="border-b border-gray-50 pb-2 flex justify-between sm:flex-col sm:border-0 sm:pb-0">
                  <dt className="text-xs text-gray-400 font-medium">Unique code (SKU)</dt>
                  <dd className="text-sm font-mono font-bold text-gray-800">{product.sku}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Interactive Actions Section */}
          <div className="mt-8 border-t border-gray-100 pt-8 space-y-4">
            {/* Quantity Selector (Only if in stock) */}
            {!isOutOfStock && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700">Quantity</span>
                <div className="flex items-center border border-gray-300 rounded-xl bg-gray-50 overflow-hidden shadow-sm h-11">
                  <button
                    onClick={handleDecrease}
                    className="px-3 py-2 text-gray-500 hover:bg-gray-200 transition focus:outline-none"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-6 text-sm font-bold text-gray-800">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrease}
                    className="px-3 py-2 text-gray-500 hover:bg-gray-200 transition focus:outline-none"
                    disabled={quantity >= product.stock}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Add to Cart CTA */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold shadow-sm transition duration-150 ${
                isOutOfStock
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none'
                  : isAdded
                  ? 'bg-green-600 text-white border border-green-600'
                  : 'bg-indigo-600 text-white border border-transparent hover:bg-indigo-700 active:scale-[0.98]'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="h-5 w-5 stroke-[3px]" />
                  <span>Added to cart successfully!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  <span>{isOutOfStock ? 'Out of stock' : `Add ${quantity} to Cart`}</span>
                </>
              )}
            </button>

            {/* Value Props / Guarantees */}
            <div className="pt-4 grid grid-cols-3 gap-2 text-center border-t border-gray-100 mt-4 text-[10px] text-gray-400 font-medium">
              <div className="flex flex-col items-center">
                <Truck className="h-4 w-4 text-indigo-500 mb-1" />
                <span>Free Shipping</span>
              </div>
              <div className="flex flex-col items-center">
                <ShieldCheck className="h-4 w-4 text-indigo-500 mb-1" />
                <span>Secure Guarantee</span>
              </div>
              <div className="flex flex-col items-center">
                <RotateCcw className="h-4 w-4 text-indigo-500 mb-1" />
                <span>Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}