'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { checkoutCart } from '@/lib/api';
import { AlertCircle, CheckCircle, Loader2, ArrowLeft, CreditCard, ShoppingBag } from 'lucide-react';

interface CheckoutFormProps {
  onBack: () => void;
  onClose: () => void;
}

export default function CheckoutForm({ onBack, onClose }: CheckoutFormProps) {
  const { items, cartTotal, clearCart } = useCart();
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  
  // Status State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [finalTotal, setFinalTotal] = useState<number>(0);

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !address.trim()) {
      setError('Please fill in all the fields in the form.');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Prepare payload
    const checkoutItems = items.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
    }));

    try {
      const response = await checkoutCart({
        items: checkoutItems,
        customer_name: name,
        customer_email: email,
        customer_address: address,
      });

      if (response && response.id !== undefined) {
        // Format the numeric order id from Go nicely (e.g. #000001)
        const formattedId = `#${response.id.toString().padStart(6, '0')}`;
        setOrderNumber(formattedId);
        // Save the final transacted total from server (or fallback to client calculation) before clearing
        setFinalTotal(response.total || cartTotal);
        // Clear global cart after successful purchase
        clearCart();
      } else {
        throw new Error('Server response does not contain the order ID.');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '';
      if (errorMessage === 'ErrInsufficientStock') {
        setError('Insufficient stock for one or more products in your cart. Please reduce quantities or remove out-of-stock items.');
      } else {
        setError(errorMessage || 'An unexpected error occurred while processing your order. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // If order was successfully completed, show Confirmation Screen
  if (orderNumber) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 px-4 sm:px-6">
        <div className="rounded-full bg-green-50 p-4 text-green-600 mb-6 ring-8 ring-green-100 animate-bounce">
          <CheckCircle className="h-14 w-14" />
        </div>

        <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Order Confirmed!</h3>
        <p className="text-sm text-green-600 font-semibold mt-1">Your order has been successfully processed.</p>
        
        {/* Receipt Box */}
        <div className="mt-8 w-full rounded-2xl border border-gray-100 bg-gray-50 p-6 text-left space-y-4">
          <div className="flex justify-between border-b border-gray-200 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Order Number</span>
            <span className="font-mono text-sm font-bold text-gray-900">{orderNumber}</span>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Shipping Details</h4>
            <p className="text-sm font-semibold text-gray-800">{name}</p>
            <p className="text-xs text-gray-500">{email}</p>
            <p className="text-xs text-gray-500 line-clamp-1">{address}</p>
          </div>

          <div className="border-t border-gray-200 pt-3 flex justify-between">
            <span className="text-sm font-bold text-gray-900">Transacted Total</span>
            <span className="text-lg font-black text-indigo-600">{formatUSD(finalTotal)}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-8 w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 transition"
        >
          Understood, Back to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition"
          aria-label="Back to cart"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-indigo-600" />
          Billing Details
        </h3>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900 shadow-sm flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-red-700 leading-relaxed font-medium">
            {error}
          </p>
        </div>
      )}

      {/* Checkout Form */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              required
              disabled={isLoading}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 transition disabled:opacity-60"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              required
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john.doe@example.com"
              className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 transition disabled:opacity-60"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Shipping Address
            </label>
            <textarea
              id="address"
              required
              disabled={isLoading}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              placeholder="e.g. 123 Main St, Apt 4B, New York, NY"
              className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 transition resize-none disabled:opacity-60"
            />
          </div>
        </div>

        {/* Order Summary Summary */}
        <div className="border-t border-gray-100 bg-gray-50 rounded-2xl p-4 space-y-2 mt-4">
          <div className="flex justify-between text-xs text-gray-500 font-medium">
            <span>Cart Amount</span>
            <span>{formatUSD(cartTotal)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 font-medium">
            <span>Shipping Cost</span>
            <span className="text-green-600 font-semibold">Free</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200/60">
            <span>Final Total</span>
            <span className="text-indigo-600">{formatUSD(cartTotal)}</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isLoading || items.length === 0}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing order...</span>
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" />
              <span>Confirm Order ({formatUSD(cartTotal)})</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}