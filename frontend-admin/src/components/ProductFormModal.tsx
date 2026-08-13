import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import { X, Save, AlertCircle } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productData: Omit<Product, 'id'>) => Promise<void>;
  product?: Product | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  product,
}) => {
  const isEditing = !!product;

  // Form States
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [weightKg, setWeightKg] = useState<number>(0);

  // Validation & Submission States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset or fill fields on open/close or product change
  useEffect(() => {
    if (isOpen) {
      if (product) {
        setSku(product.sku);
        setName(product.name);
        setDescription(product.description);
        setCategory(product.category);
        setPrice(product.price);
        setStock(product.stock);
        setWeightKg(product.weight_kg);
      } else {
        setSku('');
        setName('');
        setDescription('');
        setCategory('');
        setPrice(0);
        setStock(0);
        setWeightKg(0);
      }
      setErrors({});
    }
  }, [isOpen, product]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const tempErrors: Record<string, string> = {};

    if (!sku.trim()) tempErrors.sku = 'SKU is required.';
    if (!name.trim()) tempErrors.name = 'Name is required.';
    if (!description.trim()) tempErrors.description = 'Description is required.';
    if (!category.trim()) tempErrors.category = 'Category is required.';
    
    if (price <= 0) {
      tempErrors.price = 'Price must be a number greater than 0.';
    }
    
    if (stock < 0 || !Number.isInteger(Number(stock))) {
      tempErrors.stock = 'Stock must be an integer greater than or equal to 0.';
    }
    
    if (weightKg <= 0) {
      tempErrors.weight_kg = 'Weight must be a number greater than 0 kg.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        sku: sku.trim(),
        name: name.trim(),
        description: description.trim(),
        category: category.trim(),
        price: Number(price),
        stock: Number(stock),
        weight_kg: Number(weightKg),
      });
      onClose();
    } catch (err: any) {
      setErrors({
        api: err.response?.data?.message || err.message || 'Error saving product. Please check the data.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 max-w-lg w-full z-10 overflow-hidden transform transition-all duration-300 animate-scaleUp">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-900">
            {isEditing ? 'Edit Product' : 'Register New Product'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-150 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errors.api && (
            <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-md flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-rose-700 font-medium">{errors.api}</div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* SKU */}
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">SKU</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="PROD-100-BLUE"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition
                  ${errors.sku 
                    ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' 
                    : 'border-gray-300 focus:ring-indigo-500/20 focus:border-indigo-500'
                  }
                `}
              />
              {errors.sku && <span className="text-xs text-rose-500 font-medium mt-1 block">{errors.sku}</span>}
            </div>

            {/* Category */}
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Electronics, Home, Apparel..."
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition
                  ${errors.category 
                    ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' 
                    : 'border-gray-300 focus:ring-indigo-500/20 focus:border-indigo-500'
                  }
                `}
              />
              {errors.category && <span className="text-xs text-rose-500 font-medium mt-1 block">{errors.category}</span>}
            </div>

            {/* Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Product descriptive name"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition
                  ${errors.name 
                    ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' 
                    : 'border-gray-300 focus:ring-indigo-500/20 focus:border-indigo-500'
                  }
                `}
              />
              {errors.name && <span className="text-xs text-rose-500 font-medium mt-1 block">{errors.name}</span>}
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details on features, specifications, materials..."
                rows={2}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition resize-none
                  ${errors.description 
                    ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' 
                    : 'border-gray-300 focus:ring-indigo-500/20 focus:border-indigo-500'
                  }
                `}
              />
              {errors.description && <span className="text-xs text-rose-500 font-medium mt-1 block">{errors.description}</span>}
            </div>

            {/* Price */}
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price === 0 ? '' : price}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder="29.99"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition
                  ${errors.price 
                    ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' 
                    : 'border-gray-300 focus:ring-indigo-500/20 focus:border-indigo-500'
                  }
                `}
              />
              {errors.price && <span className="text-xs text-rose-500 font-medium mt-1 block">{errors.price}</span>}
            </div>

            {/* Stock */}
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Available Stock</label>
              <input
                type="number"
                step="1"
                min="0"
                value={stock === 0 ? '' : stock}
                onChange={(e) => setStock(Number(e.target.value))}
                placeholder="10"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition
                  ${errors.stock 
                    ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' 
                    : 'border-gray-300 focus:ring-indigo-500/20 focus:border-indigo-500'
                  }
                `}
              />
              {errors.stock && <span className="text-xs text-rose-500 font-medium mt-1 block">{errors.stock}</span>}
            </div>

            {/* Weight */}
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={weightKg === 0 ? '' : weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                placeholder="1.50"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition
                  ${errors.weight_kg 
                    ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' 
                    : 'border-gray-300 focus:ring-indigo-500/20 focus:border-indigo-500'
                  }
                `}
              />
              {errors.weight_kg && <span className="text-xs text-rose-500 font-medium mt-1 block">{errors.weight_kg}</span>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-lg transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{isEditing ? 'Save Changes' : 'Create Product'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
