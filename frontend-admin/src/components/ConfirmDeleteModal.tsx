import React, { useState } from 'react';
import type { Product } from '../types';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  product: Product | null;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  product,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error deleting product.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 max-w-md w-full z-10 overflow-hidden transform transition-all duration-300 animate-scaleUp">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Dialog Content */}
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-full flex-shrink-0">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Delete Product?</h3>
              <p className="text-xs text-gray-400 mt-0.5">This action cannot be undone.</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">SKU</span>
              <span className="font-mono text-gray-900 font-bold">{product.sku}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Name</span>
              <span className="text-gray-900 font-semibold truncate max-w-[200px]" title={product.name}>
                {product.name}
              </span>
            </div>
          </div>

          {error && (
            <div className="text-xs bg-red-50 text-red-700 p-3 rounded-lg border border-red-100 mb-4 font-medium">
              {error}
            </div>
          )}

          <p className="text-sm text-gray-600 leading-relaxed">
            Are you sure you want to permanently remove this item from the inventory and shop catalog?
          </p>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-lg transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition flex items-center space-x-1.5 disabled:opacity-50 shadow-sm hover:shadow"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Record</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
