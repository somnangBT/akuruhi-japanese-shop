import React, { useState, useRef } from 'react';
import {
  PackagePlus,
  ShoppingBag,
  Settings,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  Send,
  QrCode,
  RotateCcw,
  Eye,
  X,
  FileCheck,
  Check,
  Sliders,
  Image as ImageIcon,
  Upload,
  Palette,
  Layers,
  Sparkles,
  Building2,
  Phone,
  Star,
  MessageSquare,
  ThumbsUp,
  Download,
  Users,
  FolderOpen,
  KeyRound,
  FileText,
  Compass,
  AlertCircle,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, ProductCategory, Order, OrderStatus, Review } from '../types';
import {
  WAGYU_IMAGE,
  SAKE_IMAGE,
  SASHIMI_IMAGE,
  HERO_BANNER_IMAGE,
} from '../data/initialProducts';
import { AdminUsersTab } from './AdminUsersTab';
import { AdminImageFolderTab } from './AdminImageFolderTab';

export const AdminDashboard: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleStock,
    resetCatalog,
    orders,
    updateOrderStatus,
    deleteOrder,
    bulkDeleteOrders,
    settings,
    updateSettings,
    updateQuotationPdf,
    reviews,
    deleteReview,
    setSelectedProduct,
    setActiveView,
    exportPurchasesToExcel,
    saveUploadedImage,
    uploadedImages,
    registeredUsers,
    showToast,
    theme,
    setTheme,
    toggleTheme,
  } = useStore();

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingImage(true);
      try {
        const { url } = await saveUploadedImage(file, 'logo', `logo_${Date.now()}`);
        updateSettings({ logoUrl: url });
        showToast('Store logo uploaded and updated successfully.');
      } catch (err: any) {
        showToast(err?.message || 'Logo upload failed. Please try a different image.');
      } finally {
        setIsUploadingImage(false);
        e.target.value = '';
      }
    }
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingImage(true);
      try {
        const { url } = await saveUploadedImage(file, 'background', `background_${Date.now()}`);
        updateSettings({ backgroundImageUrl: url });
        showToast('Shop background updated successfully.');
      } catch (err: any) {
        showToast(err?.message || 'Background upload failed.');
      } finally {
        setIsUploadingImage(false);
        e.target.value = '';
      }
    }
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingImage(true);
      try {
        const { url } = await saveUploadedImage(file, 'qr_code', `payment_khqr_${Date.now()}`);
        updateSettings({ qrImageUrl: url });
        showToast('Store payment QR code uploaded successfully.');
      } catch (err: any) {
        showToast(err?.message || 'QR upload failed.');
      } finally {
        setIsUploadingImage(false);
        e.target.value = '';
      }
    }
  };

  const quotationFileInputRef = useRef<HTMLInputElement>(null);
  const handlePdfQuotationUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        showToast('Please select a valid PDF file.');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const resUrl = reader.result as string;
        updateQuotationPdf(resUrl, file.name);
        try {
          await saveUploadedImage(resUrl, 'quotation', file.name);
        } catch {
          // ignore
        }
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const BRAND_PALETTES = [
    { name: 'Akuruhi Crimson', primary: '#e11d48', hover: '#f43f5e', desc: 'Japanese authentic red' },
    { name: 'Toyosu Indigo', primary: '#1d4ed8', hover: '#2563eb', desc: 'Ocean & sashimi cobalt' },
    { name: 'Kyoto Matcha', primary: '#15803d', hover: '#16a34a', desc: 'Organic green tea' },
    { name: 'Imperial Amber', primary: '#d97706', hover: '#f59e0b', desc: 'Warm cedar & yuzu' },
    { name: 'Sakura Pink', primary: '#db2777', hover: '#f472b6', desc: 'Cherry blossom pink' },
    { name: 'Charcoal Slate', primary: '#374151', hover: '#4b5563', desc: 'Volcanic minimalist slate' },
  ];

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'users' | 'images' | 'reviews' | 'settings'>('products');
  const [productSearch, setProductSearch] = useState('');
  const [productCategory, setProductCategory] = useState<ProductCategory | 'all'>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | 'paid' | 'verification_pending' | 'unpaid'>('all');
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewStarFilter, setReviewStarFilter] = useState<'all' | number>('all');

  // Add / Edit Product Modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Order & Review Deletion confirmation modals
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    nameJp: string;
    nameKhmer: string;
    category: ProductCategory;
    price: number;
    unit: string;
    brand: string;
    description: string;
    imageUrl: string;
    inStock: boolean;
    featured: boolean;
    storageTemp: 'Frozen' | 'Chilled' | 'Room Temperature';
  }>({
    code: 'M2099',
    name: '',
    nameJp: '',
    nameKhmer: '',
    category: 'seasoning',
    price: 15.00,
    unit: '1L/Bottle',
    brand: 'Akuruhi Selection',
    description: '',
    imageUrl: HERO_BANNER_IMAGE,
    inStock: true,
    featured: false,
    storageTemp: 'Room Temperature',
  });

  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderFilter, setOrderFilter] = useState<OrderStatus | 'all'>('all');

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    if (productCategory !== 'all' && p.category !== productCategory) return false;
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (orderFilter !== 'all' && o.orderStatus !== orderFilter) return false;
    if (paymentStatusFilter !== 'all' && o.paymentStatus !== paymentStatusFilter) return false;
    return true;
  });

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingImage(true);
      try {
        const { url } = await saveUploadedImage(
          file,
          'product',
          `product_${formData.code || 'item'}_${Date.now()}`
        );
        setFormData((prev) => ({ ...prev, imageUrl: url }));
        showToast('Product image uploaded successfully.');
      } catch (err: any) {
        showToast(err?.message || 'Failed to upload product image.');
      } finally {
        setIsUploadingImage(false);
        e.target.value = '';
      }
    }
  };

  const openAddModal = () => {
    setEditingProductId(null);
    setFormData({
      code: `M${Math.floor(2000 + Math.random() * 900)}`,
      name: '',
      nameJp: '',
      nameKhmer: '',
      category: 'frozen',
      price: 25.00,
      unit: '1kg/Pkt',
      brand: 'Japan Direct',
      description: 'Imported fresh Japanese specialty product with guaranteed authenticity.',
      imageUrl: SASHIMI_IMAGE,
      inStock: true,
      featured: false,
      storageTemp: 'Frozen',
    });
    setIsProductModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProductId(p.id);
    setFormData({
      code: p.code,
      name: p.name,
      nameJp: p.nameJp || '',
      nameKhmer: p.nameKhmer || '',
      category: p.category,
      price: p.price,
      unit: p.unit,
      brand: p.brand,
      description: p.description,
      imageUrl: p.imageUrl,
      inStock: p.inStock,
      featured: p.featured || false,
      storageTemp: p.storageTemp || 'Room Temperature',
    });
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      showToast('Product name and SKU code are required.');
      return;
    }

    if (editingProductId) {
      updateProduct(editingProductId, formData);
    } else {
      addProduct(formData);
    }
    setIsProductModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0d10] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-slate-900 dark:text-neutral-100 transition-colors">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-500">
            <span>Store Operations Console</span>
            <span className="text-slate-400 dark:text-neutral-600">·</span>
            <span>Akuruhi Cambodia</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Admin Management Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Quick Theme Toggle Button in Header */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300 text-xs font-semibold border border-slate-300 dark:border-neutral-700 transition-colors shadow-xs"
            title="Toggle Light / Dark mode"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            )}
          </button>

          <button
            onClick={() => setActiveView('store')}
            className="px-4 py-2 rounded-xl bg-white dark:bg-neutral-900 hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300 text-xs font-medium border border-slate-300 dark:border-neutral-700 transition-colors shadow-xs"
          >
            ← Back to Storefront
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-950 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-neutral-400">Total Catalog Items</div>
          <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
            {products.length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-neutral-500 mt-0.5">
            {products.filter((p) => p.inStock).length} in stock
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-neutral-400">Total Customer Orders</div>
          <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
            {orders.length}
          </div>
          <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-0.5">
            {orders.filter((o) => o.orderStatus === 'pending_payment' || o.paymentStatus === 'verification_pending').length} pending actions
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-neutral-400">Total Order Revenue</div>
          <div className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            ${orders.reduce((acc, o) => acc + o.total, 0).toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-neutral-500 mt-0.5">USD (excl. VAT)</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-neutral-400">Payment Channels</div>
          <div className="font-mono text-base font-bold text-slate-900 dark:text-white mt-1">
            ABA KHQR & Telegram
          </div>
          <div className="text-[11px] text-sky-600 dark:text-sky-400 font-medium mt-0.5 truncate">
            @{settings.telegramUsername}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-neutral-800 pb-px mb-6 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'products'
              ? 'border-rose-500 text-rose-600 dark:text-white font-bold'
              : 'border-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <PackagePlus className="w-4 h-4" />
          <span>Products Inventory ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-rose-500 text-rose-600 dark:text-white font-bold'
              : 'border-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Customer Purchases ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-rose-500 text-rose-600 dark:text-white font-bold'
              : 'border-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 text-sky-500 dark:text-sky-400" />
          <span>Registered Accounts ({registeredUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('images')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'images'
              ? 'border-rose-500 text-rose-600 dark:text-white font-bold'
              : 'border-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FolderOpen className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          <span>Image Folder Sync</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'reviews'
              ? 'border-rose-500 text-rose-600 dark:text-white font-bold'
              : 'border-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Star className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          <span>Reviews ({reviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-rose-500 text-rose-600 dark:text-white font-bold'
              : 'border-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Master Settings</span>
        </button>
      </div>

      {/* --- TAB 1: PRODUCTS INVENTORY --- */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* Action & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-xs">
            <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search code, name, brand..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <select
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value as any)}
                className="bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-xs text-slate-700 dark:text-neutral-300 rounded-lg px-3 py-1.5 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="frozen">Frozen Seafood & Wagyu</option>
                <option value="seasoning">Seasoning & Sauces</option>
                <option value="curry">Curry Base</option>
                <option value="pickled">Pickled & Veg</option>
                <option value="noodles_rice">Rice & Noodles</option>
                <option value="beverages_sake">Sake & Beer</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={openAddModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-xs transition-colors"
                title="Add new product item to inventory"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product</span>
              </button>
              <button
                onClick={resetCatalog}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-slate-700 dark:text-neutral-300 border border-slate-300 dark:border-neutral-700 text-xs transition-colors"
                title="Restore default catalog from original quotation PDF"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to PDF Quotation</span>
              </button>
            </div>
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-neutral-900 text-slate-500 dark:text-neutral-400 uppercase tracking-wider font-mono border-b border-slate-200 dark:border-neutral-800 text-[11px]">
                <tr>
                  <th className="py-3 px-4">SKU / Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Unit Packaging</th>
                  <th className="py-3 px-4">Storage</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-850">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-neutral-850/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-750 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                            {p.name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono">
                            <span className="text-rose-600 dark:text-rose-400 font-bold">{p.code}</span> · {p.brand}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-neutral-300 capitalize">
                      {p.category.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      ${p.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-neutral-300">{p.unit}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-neutral-400">
                      {p.storageTemp || 'Ambient'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleStock(p.id)}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                          p.inStock
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/60'
                            : 'bg-red-100 text-red-800 border border-red-300 dark:bg-red-950/80 dark:text-red-300 dark:border-red-800/60'
                        }`}
                      >
                        {p.inStock ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300 transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setProductToDelete(p)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 dark:bg-neutral-800 dark:hover:bg-red-950/80 dark:text-neutral-400 dark:hover:text-red-400 transition-colors"
                          title="Delete Product from Inventory"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 2: ORDERS MANAGEMENT --- */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Top Export & Action Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs">
            <div>
              <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm">
                Customer Purchase Records & Order Status
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                Manage order fulfillment, verify KHQR slips, and export full customer purchase data to Excel.
              </p>
            </div>

            <button
              onClick={exportPurchasesToExcel}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950 transition-colors shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Export Purchases to Excel (.xlsx)</span>
            </button>
          </div>

          {/* Payment Status Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-850 text-xs">
            <span className="text-slate-500 dark:text-neutral-500 font-mono text-[11px] px-2">Payment Status:</span>
            {(
              [
                { id: 'all', label: 'All Purchases' },
                { id: 'paid', label: 'Paid Only' },
                { id: 'verification_pending', label: 'Verification Pending' },
                { id: 'unpaid', label: 'Unpaid' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => setPaymentStatusFilter(item.id)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  paymentStatusFilter === item.id
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white dark:bg-neutral-900 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-neutral-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Order Status Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {(
              [
                'all',
                'pending_payment',
                'verification_pending',
                'processing',
                'out_for_delivery',
                'completed',
                'cancelled',
              ] as const
            ).map((status) => (
              <button
                key={status}
                onClick={() => setOrderFilter(status as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors capitalize ${
                  orderFilter === status
                    ? 'bg-slate-800 dark:bg-neutral-700 text-white shadow-xs'
                    : 'bg-white dark:bg-neutral-900 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-neutral-800'
                }`}
              >
                {status.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-neutral-900 text-slate-500 dark:text-neutral-400 uppercase tracking-wider font-mono border-b border-slate-200 dark:border-neutral-800 text-[11px]">
                <tr>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Order Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-850">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-neutral-850/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{order.customerName}</div>
                      <div className="text-[11px] text-slate-500 dark:text-neutral-400">{order.customerPhone}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-neutral-300">
                      {order.items.reduce((acc, i) => acc + i.quantity, 0)} items
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {order.paymentMethod === 'qr_code' ? (
                          <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-mono text-[11px]">
                            <QrCode className="w-3.5 h-3.5" />
                            <span>KHQR</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-mono text-[11px]">
                            <Send className="w-3.5 h-3.5" />
                            <span>Telegram</span>
                          </span>
                        )}
                        <span className="text-slate-300 dark:text-neutral-600">·</span>
                        <span
                          className={`text-[10px] uppercase font-bold ${
                            order.paymentStatus === 'paid'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : order.paymentStatus === 'verification_pending'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-slate-400 dark:text-neutral-500'
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={order.orderStatus}
                        onChange={(e) =>
                          updateOrderStatus(
                            order.id,
                            e.target.value as OrderStatus,
                            e.target.value === 'confirmed' || e.target.value === 'processing'
                              ? 'paid'
                              : undefined
                          )
                        }
                        className="bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-800 dark:text-neutral-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
                      >
                        <option value="pending_payment">Pending Payment</option>
                        <option value="verification_pending">Verifying Slip</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 transition-colors"
                          title="View Full Order & Slip"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setOrderToDelete(order)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 dark:bg-neutral-800 dark:hover:bg-red-950/80 dark:text-neutral-400 dark:hover:text-red-400 transition-colors"
                          title="Delete Customer Purchase"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 3: REGISTERED USERS DIRECTORY --- */}
      {activeTab === 'users' && <AdminUsersTab />}

      {/* --- TAB 4: IMAGE STORAGE & LOCAL FOLDER SYNC --- */}
      {activeTab === 'images' && <AdminImageFolderTab />}

      {/* --- TAB 5: CUSTOMER REVIEWS MODERATION --- */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {/* Review Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-xs">
            <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search reviews by customer or text..."
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <select
                value={reviewStarFilter}
                onChange={(e) =>
                  setReviewStarFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))
                }
                className="bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-xs text-slate-700 dark:text-neutral-300 rounded-lg px-3 py-1.5 focus:outline-none"
              >
                <option value="all">All Star Ratings</option>
                <option value="5">5 Stars Only</option>
                <option value="4">4 Stars Only</option>
                <option value="3">3 Stars Only</option>
                <option value="2">2 Stars Only</option>
                <option value="1">1 Star Only</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 dark:text-neutral-400 font-mono">
              Average Store Rating:{' '}
              <strong className="text-amber-500 dark:text-amber-400">
                {(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)).toFixed(1)} ★
              </strong>
            </div>
          </div>

          {/* Reviews Moderation Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-neutral-900 text-slate-500 dark:text-neutral-400 uppercase tracking-wider font-mono border-b border-slate-200 dark:border-neutral-800 text-[11px]">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Review Comment</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Moderate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-850">
                {reviews
                  .filter((r) => {
                    if (reviewStarFilter !== 'all' && r.rating !== reviewStarFilter) return false;
                    if (reviewSearch.trim()) {
                      const q = reviewSearch.toLowerCase();
                      const matchedUser = r.userName.toLowerCase().includes(q);
                      const matchedComment = r.comment.toLowerCase().includes(q);
                      const prod = products.find((p) => p.id === r.productId);
                      const matchedProd = prod?.name.toLowerCase().includes(q);
                      return matchedUser || matchedComment || matchedProd;
                    }
                    return true;
                  })
                  .map((rev) => {
                    const product = products.find((p) => p.id === rev.productId);
                    return (
                      <tr key={rev.id} className="hover:bg-slate-50 dark:hover:bg-neutral-850/60 transition-colors">
                        <td className="py-3 px-4">
                          {product ? (
                            <button
                              onClick={() => setSelectedProduct(product)}
                              className="flex items-center gap-2.5 text-left hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                            >
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-8 h-8 rounded object-cover bg-slate-100 dark:bg-neutral-800 shrink-0"
                              />
                              <div className="truncate max-w-[160px]">
                                <div className="font-semibold text-slate-900 dark:text-white truncate">{product.name}</div>
                                <div className="text-[10px] text-slate-500 dark:text-neutral-400 font-mono">
                                  {product.code}
                                </div>
                              </div>
                            </button>
                          ) : (
                            <span className="text-slate-400 dark:text-neutral-500 italic">Item #{rev.productId}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white">{rev.userName}</div>
                          {rev.verifiedPurchase && (
                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1 font-medium">
                              <Check className="w-2.5 h-2.5" />
                              <span>Verified Purchase</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 font-mono font-bold">
                            <span>{rev.rating}</span>
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-neutral-300 max-w-xs">
                          <p className="line-clamp-2 leading-relaxed">{rev.comment}</p>
                        </td>
                        <td className="py-3 px-4 text-slate-500 dark:text-neutral-400 font-mono whitespace-nowrap">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setReviewToDelete(rev)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 dark:bg-neutral-800 dark:hover:bg-red-950/80 dark:text-neutral-400 dark:hover:text-red-400 transition-colors"
                            title="Delete Review"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 4: STORE & PAYMENT SETTINGS --- */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-4xl">
          {/* Section 0: Interface Appearance Theme (Light & Dark Mode) */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6 space-y-5 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-neutral-800">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <Sun className="w-4 h-4 hidden dark:inline" />
                <Moon className="w-4 h-4 inline dark:hidden" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Interface Appearance & Theme</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300">
                    Active: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  Select your preferred visual mode for browsing and managing inventory. Seamlessly adapts all surfaces, modals, tables, and receipts.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Light Mode Option */}
              <button
                type="button"
                onClick={() => {
                  setTheme('light');
                  updateSettings({ themeMode: 'light' });
                  showToast('Switched to Crisp Daylight theme mode.');
                }}
                className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between group ${
                  theme === 'light'
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 ring-2 ring-rose-500/20 shadow-md'
                    : 'border-slate-200 dark:border-neutral-800 bg-slate-50/60 dark:bg-neutral-950/60 hover:border-slate-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 flex items-center justify-center">
                      <Sun className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        Crisp Light Mode
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-neutral-400">
                        Daylight high-legibility canvas
                      </div>
                    </div>
                  </div>
                  {theme === 'light' && (
                    <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-sm">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-[11px] space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="font-semibold text-slate-900">Akuruhi Japanese Supply</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Clean daylight surfaces with high contrast borders and refined typography.
                  </div>
                </div>
              </button>

              {/* Dark Mode Option */}
              <button
                type="button"
                onClick={() => {
                  setTheme('dark');
                  updateSettings({ themeMode: 'dark' });
                  showToast('Switched to Deep Obsidian theme mode.');
                }}
                className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between group ${
                  theme === 'dark'
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 ring-2 ring-rose-500/20 shadow-md'
                    : 'border-slate-200 dark:border-neutral-800 bg-slate-50/60 dark:bg-neutral-950/60 hover:border-slate-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        Obsidian Dark Mode
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-neutral-400">
                        Atmospheric culinary ambience
                      </div>
                    </div>
                  </div>
                  {theme === 'dark' && (
                    <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-sm">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-750 text-neutral-200 text-[11px] space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="font-semibold text-white">Akuruhi Japanese Supply</span>
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    Sumi black canvas with luminescent ruby badges and deep contrast.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Section 1: Store Name & Brand Logo */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6 space-y-5 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-neutral-800">
              <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-600/20 text-rose-600 dark:text-rose-500">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Store Brand Identity & Logo
                </h2>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  Update the brand name, tagline, and shop logo displayed across the top bar, footer, and checkout.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-neutral-400 mb-1 font-medium">
                  Store Name (Primary Brand) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => updateSettings({ storeName: e.target.value })}
                  placeholder="e.g. Akuruhi Japanese Food & Beverage Supply"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-rose-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-neutral-400 mb-1 font-medium">Tagline / Sub-headline</label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => updateSettings({ tagline: e.target.value })}
                  placeholder="e.g. Japanese Food & Beverage Supply · Since 1998"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 text-sm"
                />
              </div>
            </div>

            {/* Logo Customizer */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-850 space-y-4">
              <div className="text-xs font-semibold text-slate-800 dark:text-neutral-300">
                Shop Logo Configuration
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-5">
                {/* Live Logo Preview Box */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className="w-20 h-20 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-750 flex items-center justify-center p-2 shadow-inner overflow-hidden">
                    {settings.logoUrl ? (
                      <img
                        src={settings.logoUrl}
                        alt="Store Logo Preview"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-rose-600 flex items-center justify-center font-display font-bold text-white text-xl shadow-md">
                        {settings.logoText || '旭'}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-neutral-400 font-mono">
                    {settings.logoUrl ? 'Custom Logo' : 'Text Monogram'}
                  </span>
                </div>

                {/* Upload & Controls */}
                <div className="flex-1 space-y-3 w-full text-xs">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white dark:bg-neutral-850 hover:bg-slate-100 dark:hover:bg-neutral-800 border border-slate-300 dark:border-neutral-700 text-slate-900 dark:text-white cursor-pointer transition-colors shadow-xs font-medium">
                      <Upload className="w-3.5 h-3.5 text-slate-500 dark:text-neutral-400" />
                      <span>Upload Logo Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>

                    {settings.logoUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          updateSettings({ logoUrl: '' });
                          showToast('Logo cleared. Using text monogram.');
                        }}
                        className="px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 hover:bg-red-50 dark:hover:bg-red-950/60 text-slate-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-neutral-800 transition-colors"
                      >
                        Reset to Monogram
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 dark:text-neutral-400 text-[11px] mb-1">
                        Or Paste Logo Image URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://example.com/logo.png"
                        value={settings.logoUrl || ''}
                        onChange={(e) => updateSettings({ logoUrl: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-rose-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-neutral-400 text-[11px] mb-1">
                        Fallback Text Monogram
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="e.g. 旭 or AK"
                        value={settings.logoText || ''}
                        onChange={(e) => updateSettings({ logoText: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-rose-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Brand Colors Customizer */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6 space-y-5 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-neutral-800">
              <div
                style={{
                  backgroundColor: `${settings.brandColor || '#e11d48'}25`,
                  color: settings.brandColor || '#e11d48',
                }}
                className="p-2 rounded-lg"
              >
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Brand Theme Colors & Accent Palette
                </h2>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  Select a curated culinary color scheme or customize your exact primary brand and hover colors.
                </p>
              </div>
            </div>

            {/* Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-neutral-300 mb-2">
                Curated Japanese Gourmet Palettes
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {BRAND_PALETTES.map((palette) => {
                  const isSelected =
                    (settings.brandColor || '#e11d48').toLowerCase() === palette.primary.toLowerCase();
                  return (
                    <button
                      key={palette.name}
                      type="button"
                      onClick={() => {
                        updateSettings({
                          brandColor: palette.primary,
                          brandColorHover: palette.hover,
                        });
                        showToast(`Applied "${palette.name}" brand color.`);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all relative ${
                        isSelected
                          ? 'border-slate-900 dark:border-white/80 bg-slate-100 dark:bg-neutral-850 ring-2 ring-slate-900/10 dark:ring-white/20 shadow-md'
                          : 'border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-950 hover:border-slate-300 dark:hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-5 h-5 rounded-full shadow-sm border border-slate-300 dark:border-white/20"
                          style={{ backgroundColor: palette.primary }}
                        />
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-white/20 -ml-1"
                          style={{ backgroundColor: palette.hover }}
                        />
                      </div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">{palette.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-neutral-400 truncate">{palette.desc}</div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Hex & Pickers */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-850 space-y-4 text-xs">
              <div className="font-semibold text-slate-900 dark:text-white">Custom Color Calibration</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-neutral-400 mb-1.5 font-medium">
                    Primary Brand Color (Buttons, Accents, Highlights)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.brandColor || '#e11d48'}
                      onChange={(e) => updateSettings({ brandColor: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                    />
                    <input
                      type="text"
                      value={settings.brandColor || '#e11d48'}
                      onChange={(e) => updateSettings({ brandColor: e.target.value })}
                      className="w-32 px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-neutral-500 uppercase"
                    />
                    <span className="text-[11px] text-slate-500 dark:text-neutral-500">Main brand tone</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-neutral-400 mb-1.5 font-medium">
                    Hover / Focus State Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.brandColorHover || '#f43f5e'}
                      onChange={(e) => updateSettings({ brandColorHover: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                    />
                    <input
                      type="text"
                      value={settings.brandColorHover || '#f43f5e'}
                      onChange={(e) => updateSettings({ brandColorHover: e.target.value })}
                      className="w-32 px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-neutral-500 uppercase"
                    />
                    <span className="text-[11px] text-slate-500 dark:text-neutral-500">Interactive state</span>
                  </div>
                </div>
              </div>

              {/* Live Preview Sample */}
              <div className="pt-3 border-t border-slate-200 dark:border-neutral-850 flex flex-wrap items-center gap-4">
                <span className="text-slate-500 dark:text-neutral-400 text-[11px]">Live Preview:</span>
                <button
                  type="button"
                  style={{ backgroundColor: settings.brandColor || '#e11d48' }}
                  className="px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-sm"
                >
                  Primary Action Button
                </button>
                <span
                  style={{
                    backgroundColor: `${settings.brandColor || '#e11d48'}20`,
                    color: settings.brandColor || '#e11d48',
                    borderColor: `${settings.brandColor || '#e11d48'}40`,
                  }}
                  className="px-3 py-1 rounded-full text-xs font-medium border"
                >
                  Active Tag
                </span>
                <span style={{ color: settings.brandColor || '#e11d48' }} className="font-bold text-sm">
                  $85.00 USD
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Shop Background Customization */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6 space-y-5 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-neutral-800">
              <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-600/20 text-sky-600 dark:text-sky-400">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Shop Background & Visual Ambience
                </h2>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  Set a custom background image or select authentic culinary presets for either the hero section or the entire storefront.
                </p>
              </div>
            </div>

            {/* Scope Toggle: Hero Only vs Entire Store */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-neutral-300 mb-2">
                Background Display Scope
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    updateSettings({ backgroundScope: 'hero_only' });
                    showToast('Background set to Hero section only.');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    settings.backgroundScope === 'hero_only'
                      ? 'bg-rose-50 dark:bg-rose-950/25 border-rose-500 text-slate-900 dark:text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-neutral-950 border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-400 hover:border-slate-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="font-semibold text-slate-900 dark:text-white">Hero Section Only (Default)</div>
                  <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                    Background applies to the top banner while catalog stays crisp and readable.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    updateSettings({ backgroundScope: 'entire_store' });
                    showToast('Background set to Entire Storefront.');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    settings.backgroundScope === 'entire_store'
                      ? 'bg-sky-50 dark:bg-sky-950/25 border-sky-400 text-slate-900 dark:text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-neutral-950 border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-400 hover:border-slate-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="font-semibold text-slate-900 dark:text-white">Entire Storefront (Full Immersion)</div>
                  <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                    Fixed ambient background extends seamlessly behind all products and sections.
                  </div>
                </button>
              </div>
            </div>

            {/* Curated Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-neutral-300 mb-2">
                Curated Japanese Ambiance Presets
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    name: 'Culinary Slate',
                    url: HERO_BANNER_IMAGE,
                    desc: 'Soy bottles & cedar cups',
                  },
                  {
                    name: 'A5 Wagyu Stone',
                    url: WAGYU_IMAGE,
                    desc: 'Snow-marbled ribeye',
                  },
                  {
                    name: 'Toyosu Bluefin',
                    url: SASHIMI_IMAGE,
                    desc: 'Sashimi cuts & ice',
                  },
                  {
                    name: 'Kyoto Sake Cellar',
                    url: SAKE_IMAGE,
                    desc: 'Daiginjo sake & timber',
                  },
                ].map((preset) => {
                  const isSelected = settings.backgroundImageUrl === preset.url;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        updateSettings({ backgroundImageUrl: preset.url });
                        showToast(`Selected "${preset.name}" background.`);
                      }}
                      className={`relative aspect-[16/10] rounded-xl overflow-hidden border text-left transition-all group ${
                        isSelected
                          ? 'border-rose-500 ring-2 ring-rose-500/40 shadow-md'
                          : 'border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2 flex flex-col justify-end">
                        <span className="text-[11px] font-semibold text-white truncate">
                          {preset.name}
                        </span>
                        <span className="text-[9px] text-neutral-300 truncate">
                          {preset.desc}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Upload or URL */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-850 space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Custom Background Image</div>
                  <div className="text-[11px] text-slate-500 dark:text-neutral-400">
                    Upload your own photo or paste an external image URL.
                  </div>
                </div>

                <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-850 hover:bg-slate-100 dark:hover:bg-neutral-800 border border-slate-300 dark:border-neutral-700 text-slate-900 dark:text-white cursor-pointer transition-colors shrink-0 shadow-xs font-medium">
                  <Upload className="w-3.5 h-3.5 text-slate-500 dark:text-neutral-400" />
                  <span>Upload Background</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <input
                  type="url"
                  placeholder="Or enter custom image URL (https://...)"
                  value={settings.backgroundImageUrl}
                  onChange={(e) => updateSettings({ backgroundImageUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Sliders for Darkness & Blur */}
              <div className="pt-3 border-t border-slate-300 dark:border-neutral-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs">
                  <div className="flex justify-between text-slate-800 dark:text-neutral-200 text-xs font-semibold mb-1.5">
                    <span>Background Contrast & Dimmer</span>
                    <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">
                      {Math.round((settings.backgroundDarkness ?? 0.75) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.30"
                    max="0.95"
                    step="0.05"
                    value={settings.backgroundDarkness ?? 0.75}
                    onChange={(e) =>
                      updateSettings({ backgroundDarkness: parseFloat(e.target.value) })
                    }
                    className="w-full accent-rose-600 h-2 bg-slate-300 dark:bg-neutral-750 rounded-lg cursor-pointer"
                  />
                  <div className="text-[11px] text-slate-600 dark:text-neutral-400 mt-1.5 flex items-center justify-between">
                    <span>☀️ Daytime: Light Veil</span>
                    <span>🌙 Night: Dark Scrim</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs">
                  <div className="flex justify-between text-slate-800 dark:text-neutral-200 text-xs font-semibold mb-1.5">
                    <span>Atmospheric Blur</span>
                    <span className="font-mono text-sky-600 dark:text-sky-400 font-bold">
                      {settings.backgroundBlur || 0}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="16"
                    step="1"
                    value={settings.backgroundBlur || 0}
                    onChange={(e) =>
                      updateSettings({ backgroundBlur: parseInt(e.target.value) || 0 })
                    }
                    className="w-full accent-sky-600 h-2 bg-slate-300 dark:bg-neutral-750 rounded-lg cursor-pointer"
                  />
                  <div className="text-[11px] text-slate-600 dark:text-neutral-400 mt-1.5">
                    Softens photographic details for clean readability.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Hero Headline & Homepage Copy */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-neutral-800">
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Hero Headline & Storefront Copy
                </h2>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  Customize the main display text visible to visitors on the homepage.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-neutral-400 mb-1 font-medium">Top Badge Trust Kicker</label>
                <input
                  type="text"
                  value={settings.heroBadgeText}
                  onChange={(e) => updateSettings({ heroBadgeText: e.target.value })}
                  placeholder="e.g. Akuruhi Cambodia · Since 1998 · Phnom Penh Wholesale & Retail"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-neutral-400 mb-1 font-medium">Main Hero Headline</label>
                <input
                  type="text"
                  value={settings.heroTitle}
                  onChange={(e) => updateSettings({ heroTitle: e.target.value })}
                  placeholder="e.g. Authentic Japanese Food & Beverage Supply for Cambodia."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-neutral-400 mb-1 font-medium">
                  Hero Subtitle / Description Paragraph
                </label>
                <textarea
                  rows={2}
                  value={settings.heroSubtitle}
                  onChange={(e) => updateSettings({ heroSubtitle: e.target.value })}
                  placeholder="From A5 Japanese Wagyu and Toyosu bluefin tuna..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white text-xs leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Website Information & Contact */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-neutral-800">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Website Information & Operating Details
                </h2>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  Update your physical warehouse address, operating hours, and customer inquiry contacts.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-neutral-400 mb-1 font-medium">Company Registered Name</label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => updateSettings({ companyName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-neutral-400 mb-1 font-medium">Operating Hours</label>
                  <input
                    type="text"
                    value={settings.operatingHours}
                    onChange={(e) => updateSettings({ operatingHours: e.target.value })}
                    placeholder="e.g. Mon - Sun: 8:00 AM - 8:30 PM"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-neutral-400 mb-1 font-medium">Physical Location / Warehouse Address</label>
                <input
                  type="text"
                  value={settings.location}
                  onChange={(e) => updateSettings({ location: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-neutral-400 mb-1 font-medium">Primary Hotline</label>
                  <input
                    type="text"
                    value={settings.phonePrimary}
                    onChange={(e) => updateSettings({ phonePrimary: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-neutral-400 mb-1 font-medium">Secondary Hotline</label>
                  <input
                    type="text"
                    value={settings.phoneSecondary}
                    onChange={(e) => updateSettings({ phoneSecondary: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-neutral-400 mb-1 font-medium">Top Announcement Banner</label>
                <textarea
                  rows={2}
                  value={settings.announcementText}
                  onChange={(e) => updateSettings({ announcementText: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Telegram & ABA Bank Details */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-neutral-800">
              <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-600/20 text-rose-600 dark:text-rose-500">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Payment & Ordering Channels
                </h2>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  Configure your Telegram handle for chat orders and ABA Bank / KHQR credentials.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-neutral-400 mb-1 font-medium">Telegram Store Handle</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 dark:text-neutral-500">@</span>
                  <input
                    type="text"
                    value={settings.telegramUsername}
                    onChange={(e) =>
                      updateSettings({
                        telegramUsername: e.target.value,
                        telegramDirectUrl: `https://t.me/${e.target.value}`,
                      })
                    }
                    className="w-full pl-7 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-neutral-500 mt-1">
                  Generated link: <span className="font-mono text-sky-600 dark:text-sky-400">{settings.telegramDirectUrl}</span>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-neutral-850 space-y-3">
                <h3 className="font-semibold text-slate-900 dark:text-white">ABA Bank / KHQR Details</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-neutral-400 mb-1 font-medium">Bank Name</label>
                    <input
                      type="text"
                      value={settings.bankName}
                      onChange={(e) => updateSettings({ bankName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-neutral-400 mb-1 font-medium">Account Holder Name</label>
                    <input
                      type="text"
                      value={settings.accountName}
                      onChange={(e) => updateSettings({ accountName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-neutral-400 mb-1 font-medium">Account Number (USD)</label>
                  <input
                    type="text"
                    value={settings.accountNumber}
                    onChange={(e) => updateSettings({ accountNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                {/* Store Payment QR Code Upload Section */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-850 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">Store Payment QR Code (KHQR / ABA)</div>
                      <div className="text-[11px] text-slate-500 dark:text-neutral-400">
                        Upload your official bank KHQR code image or enter an image URL. Customers will scan this directly at checkout.
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    {/* QR Code Live Preview */}
                    <div className="p-3 bg-white rounded-xl shadow-md border border-slate-200 shrink-0 flex flex-col items-center">
                      <div className="text-[9px] font-bold text-red-600 uppercase tracking-widest mb-1">
                        KHQR · MERCHANT
                      </div>
                      <div className="w-28 h-28 flex items-center justify-center overflow-hidden rounded bg-slate-50 border border-slate-200">
                        {settings.qrImageUrl ? (
                          <img
                            src={settings.qrImageUrl}
                            alt="Store QR Code"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center p-2 text-slate-700">
                            <QrCode className="w-12 h-12 text-slate-800 mb-1" />
                            <span className="text-[9px] font-mono leading-tight font-semibold text-slate-600">
                              Default Dynamic KHQR
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-[9px] font-mono text-slate-700 mt-1 font-bold truncate max-w-[120px] text-center">
                        {settings.accountName}
                      </div>
                    </div>

                    {/* Upload button & actions */}
                    <div className="flex-1 space-y-3 w-full">
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white dark:bg-neutral-850 hover:bg-slate-100 dark:hover:bg-neutral-800 border border-slate-300 dark:border-neutral-700 text-slate-900 dark:text-white cursor-pointer transition-colors text-xs font-medium shadow-xs">
                          <Upload className="w-3.5 h-3.5 text-slate-500 dark:text-neutral-400" />
                          <span>Upload QR Code Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleQrUpload}
                            className="hidden"
                          />
                        </label>

                        {settings.qrImageUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              updateSettings({ qrImageUrl: '' });
                              showToast('Custom QR removed. Restored standard dynamic KHQR.');
                            }}
                            className="px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 hover:bg-red-50 dark:hover:bg-red-950/60 text-slate-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-neutral-800 transition-colors text-xs"
                          >
                            Reset to Default KHQR
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="block text-slate-600 dark:text-neutral-400 text-[11px] mb-1 font-medium">
                          Or Paste QR Image Direct URL
                        </label>
                        <input
                          type="url"
                          placeholder="https://example.com/khqr.png"
                          value={settings.qrImageUrl || ''}
                          onChange={(e) => updateSettings({ qrImageUrl: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-neutral-500">
                        Accepted format: PNG, JPG, WebP. When uploaded, customers see your official bank QR during QR checkout.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-neutral-850 space-y-3">
                <h3 className="font-semibold text-slate-900 dark:text-white">Delivery Fee Rates</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-neutral-400 mb-1 font-medium">
                      Free Delivery Threshold ($ USD)
                    </label>
                    <input
                      type="number"
                      value={settings.freeDeliveryThreshold}
                      onChange={(e) =>
                        updateSettings({ freeDeliveryThreshold: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-neutral-400 mb-1 font-medium">
                      Standard Delivery Fee ($ USD)
                    </label>
                    <input
                      type="number"
                      value={settings.standardDeliveryFee}
                      onChange={(e) =>
                        updateSettings({ standardDeliveryFee: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 7: Administrator Security & Login Credentials (Full Authority) */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-amber-500/40 p-6 space-y-4 shadow-md">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-neutral-800">
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Administrator Account Credentials & Security</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold uppercase tracking-wider">
                    Full Authority
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  Configure the Gmail address and password required to access this Administrator Dashboard.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-amber-800 dark:text-amber-300 text-xs">
              <strong>Access Policy:</strong> Administrator login strictly requires a valid Gmail address (@gmail.com) and the password set below. Access will be denied if credentials do not match.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-neutral-400 mb-1 font-semibold">
                  Administrator Gmail Address *
                </label>
                <input
                  type="email"
                  required
                  value={settings.adminGmail}
                  onChange={(e) => updateSettings({ adminGmail: e.target.value })}
                  placeholder="e.g. limbunterm213@gmail.com"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-500 dark:text-neutral-500 mt-1 block">
                  Must be a Gmail address ending in @gmail.com
                </span>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-neutral-400 mb-1 font-semibold">
                  Administrator Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={settings.adminPassword}
                  onChange={(e) => updateSettings({ adminPassword: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-500 dark:text-neutral-500 mt-1 block">
                  Masked for security. Used to authenticate staff access in the Administrator portal.
                </span>
              </div>
            </div>
          </div>

          {/* Section 8: Official Quotation PDF Management */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-neutral-800">
              <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-600/20 text-rose-600 dark:text-rose-500">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Official Quotation PDF Management
                </h2>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  Upload, modify, or replace the official wholesale product quotation PDF viewed by customers.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-850">
              <div className="space-y-1">
                <div className="font-semibold text-slate-900 dark:text-white text-xs">
                  {settings.quotationFileName || 'Akuruhi_Cambodia_Product_Quotation_March_2026.pdf'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-neutral-400 flex items-center gap-2">
                  <span>Last Updated: <strong className="text-emerald-600 dark:text-emerald-400">{settings.quotationLastUpdated}</strong></span>
                  <span>·</span>
                  <span>Auto-synced to administrator dedicated folder</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <input
                  ref={quotationFileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handlePdfQuotationUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => quotationFileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 text-xs font-semibold transition-colors shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Upload / Replace PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 9: About Me & Company Story Section Management */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-neutral-800">
              <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  "About Me" & Company Story Section
                </h2>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  The About Me section highlights your 28-year heritage, Toyosu air shipments, cold-chain assurance, and showrooms. It is only editable by administrators.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-850">
              <div className="space-y-1">
                <div className="font-semibold text-slate-900 dark:text-white text-xs">
                  {settings.aboutMe?.heroTitle || 'Direct Japanese Culinary Heritage & Wholesale Supply'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-neutral-400">
                  Director: <strong>{settings.aboutMe?.founderName || 'Kenta Tanaka'}</strong> · Customers have read-only view.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveView('about')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-950 transition-colors shrink-0"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>View & Edit "About Me" Section</span>
              </button>
            </div>
          </div>

          {/* Section 10: Storefront Footer Customization & Brand Partners */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6 space-y-5 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-neutral-800">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Storefront Footer Customization</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/50">
                    Live Storefront
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  Manage the footer description, partner brand logos strip, support channels, copyright text, and navigation titles.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Partner Brands Strip Settings */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-850 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    Brand Partners & Direct Importers Strip
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-neutral-300 font-medium">
                    <input
                      type="checkbox"
                      checked={settings.footerShowPartnerLogos !== false}
                      onChange={(e) =>
                        updateSettings({ footerShowPartnerLogos: e.target.checked })
                      }
                      className="rounded bg-slate-100 dark:bg-neutral-800 border-slate-300 dark:border-neutral-700 text-rose-600 focus:ring-rose-500"
                    />
                    <span>Show Partner Strip</span>
                  </label>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-neutral-400 mb-1 font-medium">
                    Strip Header Label
                  </label>
                  <input
                    type="text"
                    value={settings.footerBrandPartnersTitle || 'Our Brand Partners & Direct Importers'}
                    onChange={(e) => updateSettings({ footerBrandPartnersTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-neutral-400 mb-1 font-medium">
                    Partner Brands (Comma-separated list)
                  </label>
                  <textarea
                    rows={2}
                    value={(settings.partnerBrands || []).join(', ')}
                    onChange={(e) => {
                      const list = e.target.value.split(',').map((b) => b.trim()).filter(Boolean);
                      updateSettings({ partnerBrands: list });
                    }}
                    placeholder="Kewpie, Asahi, Mizkan, Kikkoman, Kirin, S&B, Choya..."
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white font-mono"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {(settings.partnerBrands || []).map((b) => (
                      <span
                        key={b}
                        className="px-2 py-0.5 rounded-md bg-white dark:bg-neutral-850 border border-slate-200 dark:border-neutral-750 text-[10px] text-slate-700 dark:text-neutral-300"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Company Description in Footer */}
              <div>
                <label className="block text-slate-700 dark:text-neutral-300 font-semibold mb-1">
                  Footer Company Description Paragraph
                </label>
                <textarea
                  rows={2}
                  value={settings.footerDescription || ''}
                  onChange={(e) => updateSettings({ footerDescription: e.target.value })}
                  placeholder="Supplying premium hotels, authentic Japanese izakayas, sushi restaurants, and residential gourmet connoisseurs across Phnom Penh..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white leading-relaxed"
                />
              </div>

              {/* Column Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-neutral-300 font-semibold mb-1">
                    Support Column Title
                  </label>
                  <input
                    type="text"
                    value={settings.footerSupportTitle || 'Instant Support & Pay'}
                    onChange={(e) => updateSettings({ footerSupportTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-neutral-300 font-semibold mb-1">
                    Navigation Column Title
                  </label>
                  <input
                    type="text"
                    value={settings.footerNavigationTitle || 'Store Navigation'}
                    onChange={(e) => updateSettings({ footerNavigationTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Support Blurb */}
              <div>
                <label className="block text-slate-700 dark:text-neutral-300 font-semibold mb-1">
                  Support & Telegram Ordering Blurb
                </label>
                <textarea
                  rows={2}
                  value={settings.footerSupportText || ''}
                  onChange={(e) => updateSettings({ footerSupportText: e.target.value })}
                  placeholder="Order online with ABA KHQR payment confirmation or chat with our sales staff directly on Telegram for bulk quotes."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Bottom Copyright & Location Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-neutral-300 font-semibold mb-1">
                    Copyright Line
                  </label>
                  <input
                    type="text"
                    value={settings.footerCopyright || `© ${new Date().getFullYear()} Akuruhi Cambodia Co., Ltd. All rights reserved.`}
                    onChange={(e) => updateSettings({ footerCopyright: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-neutral-300 font-semibold mb-1">
                    Location / City Tag
                  </label>
                  <input
                    type="text"
                    value={settings.footerLocationTag || 'Phnom Penh, Cambodia'}
                    onChange={(e) => updateSettings({ footerLocationTag: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* --- ADD / EDIT PRODUCT MODAL --- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white dark:bg-[#11141c] rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-8 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
              <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                {editingProductId ? 'Edit Product' : 'Add New Product to Catalog'}
              </h2>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-neutral-400 mb-1 font-medium">SKU / Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-neutral-400 mb-1 font-medium">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-neutral-400 mb-1 font-medium">Product Title (English) *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Japanese Ribeye Wagyu A5"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-neutral-400 mb-1 font-medium">Japanese Name</label>
                  <input
                    type="text"
                    value={formData.nameJp}
                    onChange={(e) => setFormData({ ...formData, nameJp: e.target.value })}
                    placeholder="e.g. 熊本産 和牛A5"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-neutral-400 mb-1 font-medium">Khmer Name (Optional)</label>
                  <input
                    type="text"
                    value={formData.nameKhmer}
                    onChange={(e) => setFormData({ ...formData, nameKhmer: e.target.value })}
                    placeholder="e.g. សាច់គោជប៉ុន A5"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-neutral-400 mb-1 font-medium">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="frozen">Frozen Seafood & Wagyu</option>
                    <option value="seasoning">Seasoning & Sauces</option>
                    <option value="curry">Curry Base</option>
                    <option value="pickled">Pickled & Veg</option>
                    <option value="noodles_rice">Rice & Noodles</option>
                    <option value="beverages_sake">Sake & Beer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-neutral-400 mb-1 font-medium">Price ($ USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-neutral-400 mb-1 font-medium">Packaging Unit *</label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g. 1kg/Pkt, 1.8L/Btl"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-neutral-400 mb-1 font-medium">Storage Temperature</label>
                  <select
                    value={formData.storageTemp}
                    onChange={(e) =>
                      setFormData({ ...formData, storageTemp: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="Frozen">Frozen (-20°C)</option>
                    <option value="Chilled">Chilled (0-4°C)</option>
                    <option value="Room Temperature">Room Temperature</option>
                  </select>
                </div>

                {/* Product Image Upload from Computer + Local Folder Sync + Presets */}
                <div className="col-span-2 space-y-2.5 p-3 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-850">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-800 dark:text-neutral-300 font-semibold text-xs">
                      Product Image (Upload Option)
                    </label>
                    <span className="text-[10px] text-sky-600 dark:text-sky-400 font-mono">
                      📁 Auto-saved to dedicated folder
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Preview Thumbnail */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-750 shrink-0 flex items-center justify-center shadow-xs">
                      {formData.imageUrl ? (
                        <img
                          src={formData.imageUrl}
                          alt="Product preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-400 dark:text-neutral-600" />
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <label className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold shadow-xs transition-colors ${
                        isUploadingImage
                          ? 'bg-slate-100 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-400 dark:text-neutral-400 cursor-not-allowed'
                          : 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-600/15 dark:hover:bg-rose-600/25 border-rose-200 dark:border-rose-500/40 text-rose-600 dark:text-rose-300 cursor-pointer'
                      }`}>
                        <Upload className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                        <span>{isUploadingImage ? 'Processing & Optimizing Image...' : 'Upload Image from Computer'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploadingImage}
                          onChange={handleProductImageUpload}
                          className="hidden"
                        />
                      </label>

                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          placeholder="Or paste direct image URL (https://...)"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white text-[11px] font-mono focus:outline-none focus:border-rose-500"
                        />
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) setFormData({ ...formData, imageUrl: e.target.value });
                          }}
                          className="px-2 py-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 text-[11px]"
                        >
                          <option value="">Presets...</option>
                          <option value={HERO_BANNER_IMAGE}>Hero Culinary Spread</option>
                          <option value={WAGYU_IMAGE}>Wagyu A5 Steak</option>
                          <option value={SASHIMI_IMAGE}>Fresh Sashimi Seafood</option>
                          <option value={SAKE_IMAGE}>Dassai Sake Bottle</option>
                        </select>
                      </div>

                      {/* Pick from Administrator Uploaded Images Repository */}
                      {uploadedImages.length > 0 && (
                        <div className="pt-2 border-t border-slate-200 dark:border-neutral-850">
                          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-neutral-400 mb-1.5">
                            <span className="font-semibold text-slate-700 dark:text-neutral-300">Link from Uploaded Syncs:</span>
                            <span className="font-mono text-sky-600 dark:text-sky-400">{uploadedImages.length} available</span>
                          </div>
                          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                            {uploadedImages.slice(0, 8).map((img) => (
                              <button
                                key={img.id}
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({ ...prev, imageUrl: img.url }));
                                  showToast(`Linked image "${img.name}" to product.`);
                                }}
                                className={`w-9 h-9 rounded-lg overflow-hidden border shrink-0 transition-transform hover:scale-105 ${
                                  formData.imageUrl === img.url
                                    ? 'border-rose-500 ring-2 ring-rose-500/30'
                                    : 'border-slate-200 dark:border-neutral-750 bg-slate-50 dark:bg-neutral-900 hover:border-slate-400 dark:hover:border-neutral-500'
                                }`}
                                title={`Click to link ${img.name}`}
                              >
                                <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-neutral-400 mb-1 font-medium">Product Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-800 dark:text-white font-medium">
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    className="rounded bg-slate-100 dark:bg-neutral-800 border-slate-300 dark:border-neutral-700 text-rose-600 focus:ring-rose-500"
                  />
                  <span>Mark as In Stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-800 dark:text-white font-medium">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded bg-slate-100 dark:bg-neutral-800 border-slate-300 dark:border-neutral-700 text-rose-600 focus:ring-rose-500"
                  />
                  <span>Feature on Homepage</span>
                </label>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-neutral-800">
                {editingProductId ? (
                  <button
                    type="button"
                    onClick={() => {
                      const target = products.find((p) => p.id === editingProductId);
                      if (target) {
                        setIsProductModalOpen(false);
                        setProductToDelete(target);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/60 dark:hover:bg-red-900/80 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800/60 text-xs font-semibold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Product</span>
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-slate-700 dark:text-neutral-300 text-xs font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md shadow-rose-950 transition-colors"
                  >
                    {editingProductId ? 'Update Product' : 'Add to Catalog'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ORDER DETAIL MODAL --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#11141c] rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-2xl p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
              <div>
                <span className="text-xs text-slate-500 dark:text-neutral-500">Order Inspection</span>
                <h3 className="font-mono font-bold text-lg text-slate-900 dark:text-white">
                  {selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-neutral-400">Customer:</span>
                  <span className="text-slate-900 dark:text-white font-semibold">{selectedOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-neutral-400">Phone:</span>
                  <span className="text-slate-900 dark:text-white font-mono">{selectedOrder.customerPhone}</span>
                </div>
                {selectedOrder.telegramHandle && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-neutral-400">Telegram:</span>
                    <span className="text-sky-600 dark:text-sky-400 font-mono">@{selectedOrder.telegramHandle.replace('@', '')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-neutral-400">Delivery Address:</span>
                  <span className="text-slate-900 dark:text-white text-right max-w-xs">{selectedOrder.deliveryAddress}</span>
                </div>
                {selectedOrder.deliveryNotes && (
                  <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-neutral-850">
                    <span className="text-slate-500 dark:text-neutral-400">Notes:</span>
                    <span className="text-amber-600 dark:text-amber-300 italic">{selectedOrder.deliveryNotes}</span>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div>
                <div className="font-semibold text-slate-800 dark:text-neutral-300 mb-1.5">Ordered Items:</div>
                <div className="max-h-40 overflow-y-auto space-y-1.5 divide-y divide-slate-100 dark:divide-neutral-850">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="pt-1.5 first:pt-0 flex justify-between items-center">
                      <div>
                        <span className="font-medium text-slate-900 dark:text-white">{item.product.name}</span>
                        <span className="text-slate-500 dark:text-neutral-500 font-mono ml-2">x{item.quantity}</span>
                      </div>
                      <span className="font-mono text-slate-900 dark:text-white tabular-nums font-semibold">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-neutral-800 flex justify-between text-sm">
                <span className="font-semibold text-slate-900 dark:text-white">Grand Total:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  ${selectedOrder.total.toFixed(2)} USD
                </span>
              </div>

              {/* Payment Receipt / Ref check */}
              {selectedOrder.paymentSlipUrl && (
                <div className="pt-2 border-t border-slate-200 dark:border-neutral-800">
                  <div className="font-semibold text-slate-800 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Customer Uploaded Bank Slip:</span>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-neutral-800 max-h-56 bg-slate-100 dark:bg-neutral-950 p-1">
                    <img
                      src={selectedOrder.paymentSlipUrl}
                      alt="Bank transfer slip"
                      className="w-full object-contain max-h-52 mx-auto rounded-lg"
                    />
                  </div>
                </div>
              )}

              {selectedOrder.transactionRef && (
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 font-mono text-[11px] text-slate-700 dark:text-neutral-300">
                  Transaction Ref: <strong className="text-slate-900 dark:text-white">{selectedOrder.transactionRef}</strong>
                </div>
              )}

              {/* Quick Status Update Buttons & Order Deletion */}
              <div className="pt-3 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedOrder;
                    setSelectedOrder(null);
                    setOrderToDelete(target);
                  }}
                  className="py-2 px-3 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/80 dark:hover:bg-red-900 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-300 font-semibold text-xs transition-colors flex items-center gap-1.5 shrink-0"
                  title="Delete this purchase order"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
                <button
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'confirmed', 'paid');
                    setSelectedOrder(null);
                  }}
                  className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  Verify & Confirm
                </button>
                <button
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'out_for_delivery');
                    setSelectedOrder(null);
                  }}
                  className="flex-1 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  Mark Out for Delivery
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE PRODUCT CONFIRMATION MODAL --- */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-[#11141c] rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                    Delete Product
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                    Admin inventory management
                  </span>
                </div>
              </div>
              <button
                onClick={() => setProductToDelete(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                Are you sure you want to delete this product from the inventory? This will permanently remove it from the catalog and customer storefront.
              </p>

              {/* Product Preview Card */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-neutral-900/90 border border-slate-200 dark:border-neutral-800">
                <img
                  src={productToDelete.imageUrl}
                  alt={productToDelete.name}
                  className="w-12 h-12 rounded-lg object-cover bg-slate-200 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-750 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                    {productToDelete.name}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-neutral-400 font-mono mt-0.5">
                    <span className="text-rose-600 dark:text-rose-400 font-bold">{productToDelete.code}</span>
                    <span>·</span>
                    <span className="capitalize">{productToDelete.category.replace('_', ' ')}</span>
                    <span>·</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">${productToDelete.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-850 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteProduct(productToDelete.id);
                  setProductToDelete(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md shadow-red-950 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE CUSTOMER PURCHASE / ORDER CONFIRMATION MODAL --- */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-[#11141c] rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                    Delete Customer Purchase
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                    Administrator order management
                  </span>
                </div>
              </div>
              <button
                onClick={() => setOrderToDelete(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
              Are you sure you want to permanently delete purchase record <strong className="text-slate-900 dark:text-white font-mono">{orderToDelete.orderNumber}</strong>? This action cannot be undone.
            </p>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-neutral-400">Customer:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{orderToDelete.customerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-neutral-400">Phone:</span>
                <span className="font-mono text-slate-700 dark:text-neutral-300">{orderToDelete.customerPhone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-neutral-400">Order Items:</span>
                <span className="text-slate-700 dark:text-neutral-300">{orderToDelete.items.reduce((acc, i) => acc + i.quantity, 0)} items</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-neutral-850">
                <span className="text-slate-500 dark:text-neutral-400">Total Purchase:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">${orderToDelete.total.toFixed(2)} USD</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-850 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteOrder(orderToDelete.id);
                  setOrderToDelete(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md shadow-red-950 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Order</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE REVIEW CONFIRMATION MODAL --- */}
      {reviewToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-[#11141c] rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                    Delete Customer Review
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                    Product moderation console
                  </span>
                </div>
              </div>
              <button
                onClick={() => setReviewToDelete(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
              Are you sure you want to permanently delete this customer review?
            </p>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-900 dark:text-white">{reviewToDelete.userName}</span>
                <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 font-bold font-mono">
                  <span>{reviewToDelete.rating}</span>
                  <Star className="w-3.5 h-3.5 fill-amber-500 dark:fill-amber-400" />
                </div>
              </div>
              <p className="text-slate-700 dark:text-neutral-300 italic bg-white dark:bg-neutral-950 p-2.5 rounded-lg border border-slate-200 dark:border-neutral-850">
                "{reviewToDelete.comment}"
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setReviewToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-850 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteReview(reviewToDelete.id);
                  setReviewToDelete(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md shadow-red-950 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Review</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
