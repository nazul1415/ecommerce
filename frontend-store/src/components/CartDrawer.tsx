'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { X, ShoppingCart, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import CheckoutForm from './CheckoutForm';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount } = useCart();
  const [view, setView] = useState<'cart' | 'checkout'>('cart');

  // Reset back to cart view when drawer is closed / opened
  useEffect(() => {
    if (isOpen) {
      setView('cart');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      <div className="absolute inset-0 overflow-hidden">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-gray-500/75 transition-opacity backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div className="pointer-events-auto w-screen max-w-md">
            <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-2xl">
              {/* Drawer Header (Only in Cart View) */}
              {view === 'cart' && (
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-6 sm:px-6">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-indigo-600" />
                    Your Cart ({cartCount})
                  </h2>
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-2 transition focus:outline-none"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              )}

              {/* Drawer Content */}
              <div className="flex-grow overflow-y-auto py-6 px-4 sm:px-6">
                {view === 'checkout' ? (
                  <CheckoutForm onBack={() => setView('cart')} onClose={onClose} />
                ) : items.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center py-12">
                    <div className="rounded-full bg-indigo-50 p-6 text-indigo-500 mb-4">
                      <ShoppingCart className="h-10 w-10" />
                    </div>
                    <p className="text-base font-semibold text-gray-900">Your cart is empty</p>
                    <p className="mt-1 text-sm text-gray-500">Explore our catalog and add products!</p>
                    <button
                      onClick={onClose}
                      className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex py-4 border-b border-gray-50 items-center justify-between gap-4">
                        {/* Product Icon & Info */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-xl shrink-0 border border-indigo-100">
                            {item.product.category === 'Plushies' ? '🧸' : 
                             item.product.category === 'Apparel' ? '👕' : 
                             item.product.category === 'Accessories' ? '☕' : '📦'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-indigo-600 bg-indigo-50 rounded border border-indigo-100 uppercase mb-0.5">
                              {item.product.category}
                            </span>
                            <h3 className="text-sm font-bold text-gray-900 truncate">
                              {item.product.name}
                            </h3>
                            <p className="text-[10px] text-gray-400 font-medium">SKU: {item.product.sku}</p>
                            <p className="text-sm font-semibold text-indigo-600 mt-1">
                              {formatUSD(item.product.price)} each
                            </p>
                          </div>
                        </div>

                        {/* Quantity & Actions */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 overflow-hidden h-8">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="px-2 py-1 text-gray-500 hover:bg-gray-200 transition"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-3 text-xs font-semibold text-gray-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="px-2 py-1 text-gray-500 hover:bg-gray-200 transition"
                              disabled={item.product.stock !== undefined && item.quantity >= item.product.stock}
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium transition"
                            aria-label="Remove product"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Drawer Footer (Only in Cart View and when Cart has items) */}
              {view === 'cart' && items.length > 0 && (
                <div className="border-t border-gray-100 bg-gray-50 py-6 px-4 sm:px-6">
                  <div className="space-y-1.5 pb-4 border-b border-gray-200/60 mb-4">
                    <div className="flex justify-between text-sm text-gray-500 font-medium">
                      <p>Subtotal</p>
                      <p>{formatUSD(cartTotal)}</p>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 font-medium">
                      <p>Shipping</p>
                      <p className="text-green-600 font-semibold">Free</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-base font-bold text-gray-900 mb-6">
                    <p>Order Total</p>
                    <p className="text-lg text-indigo-600">{formatUSD(cartTotal)}</p>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => setView('checkout')}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-4 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 transition"
                    >
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={clearCart}
                      className="flex items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
