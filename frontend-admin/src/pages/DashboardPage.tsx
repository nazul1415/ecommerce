import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/productService';
import type { Product } from '../types';
import { ProductFormModal } from '../components/ProductFormModal';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import {
  LogOut,
  Search,
  Plus,
  UploadCloud,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Boxes,
  CheckCircle,
  X,
  AlertCircle
} from 'lucide-react';

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  // Product and Pagination States
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Search States with Debounce
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Toast Notification States
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  // Search Debounce Implementation (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on new search
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // Fetch products on page or search term change
  useEffect(() => {
    fetchProductsList();
  }, [page, debouncedSearch]);

  const fetchProductsList = async () => {
    setIsLoading(true);
    try {
      const response = await getProducts(page, limit, debouncedSearch);
      const items = response.products || [];
      const totalCount = response.total || 0;
      const pageSize = response.limit || limit || 10;
      const computedTotalPages = Math.ceil(totalCount / pageSize) || 1;

      // Self-healing navigation: redirect if requested page is out of valid bounds
      if (page > computedTotalPages && computedTotalPages > 0) {
        setPage(computedTotalPages);
        return; // Halt to trigger reloading with correct page index
      }

      setProducts(items);
      setTotalItems(totalCount);
      setTotalPages(computedTotalPages);
    } catch (err: any) {
      showNotification('Error loading the product catalog.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Show Toast Notifications
  const showNotification = (message: string, type: 'success' | 'error') => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setToast({ message, type });
    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Create/Edit Handlers
  const handleOpenCreate = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (productData: Omit<Product, 'id'>) => {
    if (selectedProduct) {
      // Edit
      await updateProduct(selectedProduct.id, productData);
      showNotification('Product updated successfully!', 'success');
    } else {
      // Create
      await createProduct(productData);
      showNotification('Product created successfully!', 'success');
    }
    fetchProductsList();
  };

  // Delete Handlers
  const handleOpenDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedProduct) {
      await deleteProduct(selectedProduct.id);
      showNotification('Product permanently deleted!', 'success');
      // If we are on page > 1 and delete the last element, move one page back
      if (products.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchProductsList();
      }
    }
  };

  // Dynamic stock badging
  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100">
          Out of Stock (0)
        </span>
      );
    }
    if (stock < 5) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
          Low Stock ({stock})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
        In Stock ({stock})
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      
      {/* Toast Notification Deck */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-slideIn">
          <div className={`p-4 rounded-xl shadow-lg flex items-center space-x-3 border max-w-sm
            ${toast.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border-rose-200'
            }
          `}>
            {toast.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
            )}
            <span className="text-sm font-semibold flex-grow">{toast.message}</span>
            <button 
              onClick={() => setToast(null)}
              className="p-0.5 rounded-md hover:bg-black/5 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Navigation Bar */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                E
              </div>
              <span className="font-bold text-gray-900 text-lg">E-Commerce Admin</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 font-medium hidden sm:inline-block">
                Admin: <span className="text-indigo-600 font-semibold">{user?.email}</span>
              </span>
              <button
                onClick={logout}
                className="flex items-center space-x-1.5 px-3.5 py-2 border border-gray-200 hover:border-red-200 rounded-lg text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Application Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
              <Boxes className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Inventory Catalog</h1>
              <p className="text-sm text-gray-500">Manage SKU codes, pricing, stock levels, and physical specifications.</p>
            </div>
          </div>

          {/* Action Deck */}
          <div className="flex items-center gap-3">
            <Link
              to="/import"
              className="flex items-center space-x-2 px-4 py-2.5 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-semibold transition shadow-xs"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Bulk Upload (CSV)</span>
            </Link>
            <button
              onClick={handleOpenCreate}
              className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition shadow-sm hover:shadow"
            >
              <Plus className="h-4 w-4" />
              <span>New Product</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-4 border border-gray-100 rounded-xl shadow-xs flex items-center">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by SKU, Name, or Category..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition"
            />
          </div>
          {debouncedSearch && (
            <span className="ml-4 text-xs font-semibold px-2.5 py-1 bg-gray-150 text-gray-600 rounded-full">
              Active filter: "{debouncedSearch}"
            </span>
          )}
        </div>

        {/* Inventory Listing & Table */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-3">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-100 border-t-indigo-600"></div>
              <p className="text-gray-500 text-sm font-medium">Querying catalog...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center space-y-3 max-w-sm mx-auto">
              <div className="mx-auto h-12 w-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900">No results</h3>
              <p className="text-sm text-gray-500">
                We couldn't find any products matching your search criteria. Please try another term.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 font-bold text-gray-700 text-xs uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-4 font-bold text-gray-700 text-xs uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 font-bold text-gray-700 text-xs uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 font-bold text-gray-700 text-xs uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 font-bold text-gray-700 text-xs uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-4 font-bold text-gray-700 text-xs uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-gray-500 font-bold text-xs">{product.sku}</td>
                      <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate" title={product.name}>
                        {product.name}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">{getStockBadge(product.stock)}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="inline-flex items-center p-2 border border-gray-200 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 transition"
                          title="Edit product"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(product)}
                          className="inline-flex items-center p-2 border border-gray-200 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition"
                          title="Delete product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Lower Pagination Toolbar */}
          {!isLoading && totalItems > 0 && (
            <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-gray-500 font-medium">
                Showing <strong className="text-gray-900">{products.length}</strong> of <strong className="text-gray-900">{totalItems}</strong> registered products
              </span>

              {/* Navigation buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="p-1.5 border border-gray-200 rounded-lg bg-white text-gray-500 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Previous"
                >
                  <ChevronLeft className="h-4.5 w-4.5" />
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`h-8 w-8 text-xs font-bold rounded-lg transition
                        ${page === p
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                        }
                      `}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="p-1.5 border border-gray-200 rounded-lg bg-white text-gray-500 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Next"
                >
                  <ChevronRight className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          )}
        </div>

      </main>

      {/* CRUD Modals */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        product={selectedProduct}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        product={selectedProduct}
      />

    </div>
  );
};

export default DashboardPage;
