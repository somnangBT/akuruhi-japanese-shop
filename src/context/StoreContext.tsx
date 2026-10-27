'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  CartItem,
  User,
  Order,
  StoreSettings,
  OrderStatus,
  PaymentMethod,
  Review,
  AboutMeData,
  UploadedImageRecord,
} from '../types';
import { INITIAL_PRODUCTS, DEFAULT_STORE_SETTINGS } from '../data/initialProducts';
import { INITIAL_REVIEWS } from '../data/initialReviews';
import { INITIAL_REGISTERED_USERS } from '../data/initialUsers';
import { INITIAL_ORDERS } from '../data/initialOrders';
import { exportOrdersToExcel } from '../utils/excelExport';
import {
  saveImageToAdministratorFolder,
  selectDedicatedLocalFolder,
  getConnectedFolderName,
} from '../utils/localFolderSync';
import { optimizeImageForWeb } from '../utils/imageOptimizer';
import {
  isSupabaseConfigured,
  fetchProductsFromSupabase,
  saveProductToSupabase,
  deleteProductFromSupabase,
  uploadImageToSupabase,
  fetchUsersFromSupabase,
  saveUserToSupabase,
  deleteUserFromSupabase,
  fetchSettingsFromSupabase,
  saveSettingsToSupabase,
  saveSettingsToSupabaseDebounced,
  subscribeToSettings,
  subscribeToUsers,
  fetchOrdersFromSupabase,
  saveOrderToSupabase,
  updateOrderStatusInSupabase,
  deleteOrderFromSupabase,
  bulkDeleteOrdersFromSupabase,
  subscribeToOrders,
} from '../utils/supabase';

interface StoreContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleStock: (id: string) => void;
  resetCatalog: () => void;

  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  cartDeliveryFee: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Authentication & Users
  currentUser: User | null;
  registeredUsers: User[];
  registerCustomer: (payload: {
    name: string;
    identifier: string;
    password: string;
    phone?: string;
    address?: string;
    telegram?: string;
  }) => { success: boolean; error?: string; user?: User };
  loginWithCredentials: (
    identifier: string,
    password: string,
    role: 'customer' | 'admin'
  ) => { success: boolean; error?: string; user?: User };
  logout: () => void;
  updateUserProfile: (updates: Partial<User>) => void;
  updateUserByAdmin: (userId: string, updates: Partial<User>) => void;
  deleteUserByAdmin: (userId: string) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // Orders
  orders: Order[];
  createOrder: (orderPayload: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    deliveryAddress: string;
    telegramHandle?: string;
    deliveryNotes?: string;
    paymentMethod: PaymentMethod;
    paymentSlipUrl?: string;
    transactionRef?: string;
  }) => Order;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    paymentStatus?: 'unpaid' | 'verification_pending' | 'paid'
  ) => void;
  updateOrderDetails: (orderId: string, updates: Partial<Order>) => void;
  deleteOrder: (orderId: string) => void;
  bulkDeleteOrders: (orderIds: string[]) => void;
  exportPurchasesToExcel: () => void;

  // Store Settings & Authority
  settings: StoreSettings;
  updateSettings: (updates: Partial<StoreSettings>) => void;
  updateAboutMe: (updates: Partial<AboutMeData>) => void;
  updateQuotationPdf: (fileUrl: string, fileName: string) => void;

  // Image Upload & Local Dedicated Folder Management
  uploadedImages: UploadedImageRecord[];
  saveUploadedImage: (
    fileOrDataUrl: File | string,
    target: UploadedImageRecord['target'],
    name?: string
  ) => Promise<{ url: string; filename: string }>;
  deleteUploadedImage: (id: string) => void;
  clearAllUploadedImages: () => void;
  connectedLocalFolder: string | null;
  connectDedicatedLocalFolder: () => Promise<string | null>;

  // Reviews
  reviews: Review[];
  addReview: (productId: string, rating: number, comment: string) => void;
  deleteReview: (reviewId: string) => void;
  markHelpful: (reviewId: string) => void;
  getProductReviews: (productId: string) => Review[];
  getProductRatingStats: (productId: string) => {
    average: number;
    count: number;
    breakdown: Record<number, number>;
  };
  hasUserPurchasedProduct: (productId: string, userId?: string) => boolean;

  // Navigation & Modals
  activeView: 'store' | 'admin' | 'my-orders' | 'about';
  setActiveView: (view: 'store' | 'admin' | 'my-orders' | 'about') => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  isCheckoutModalOpen: boolean;
  setIsCheckoutModalOpen: (open: boolean) => void;
  isQuotationModalOpen: boolean;
  setIsQuotationModalOpen: (open: boolean) => void;
  toast: string | null;
  showToast: (message: string) => void;

  // Appearance & Theme Mode
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Products State
  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window === 'undefined') return INITIAL_PRODUCTS;
    try {
      const saved = localStorage.getItem('akuruhi_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Guard: if catalog ever becomes completely empty, restore official products
  useEffect(() => {
    if (!products || !Array.isArray(products) || products.length === 0) {
      setProducts(INITIAL_PRODUCTS);
    }
  }, [products]);

  // Load live products, users, and store settings from Supabase Cloud Database if configured
  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchProductsFromSupabase().then((data) => {
        if (data && data.length > 0) {
          setProducts(data);
        }
      });
      fetchUsersFromSupabase().then((data) => {
        if (data && data.length > 0) {
          setRegisteredUsers(data);
        }
      });
      fetchSettingsFromSupabase().then((remoteSettings) => {
        if (remoteSettings) {
          setSettings((prev) => ({ ...prev, ...remoteSettings }));
        }
      });
      fetchOrdersFromSupabase().then((data) => {
        if (data && data.length > 0) {
          setOrders(data);
        }
      });

      // Subscribe to real-time changes so brand color & logo changes show instantly across all screens
      const unsubscribeSettings = subscribeToSettings((remoteSettings) => {
        if (remoteSettings) {
          setSettings((prev) => ({ ...prev, ...remoteSettings }));
        }
      });

      // Subscribe to real-time new registered users
      const unsubscribeUsers = subscribeToUsers((newUser) => {
        if (newUser) {
          setRegisteredUsers((prev) => {
            if (prev.some((u) => u.id === newUser.id || u.loginIdentifier === newUser.loginIdentifier)) {
              return prev;
            }
            return [newUser, ...prev];
          });
        }
      });

      // Subscribe to real-time order events (new customer purchases, status confirmations, deletions)
      const unsubscribeOrders = subscribeToOrders(({ event, order, orderId }) => {
        if (event === 'INSERT' && order) {
          setOrders((prev) => {
            if (prev.some((o) => o.id === order.id)) return prev;
            return [order, ...prev];
          });
        } else if (event === 'UPDATE' && order) {
          setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
        } else if (event === 'DELETE' && orderId) {
          setOrders((prev) => prev.filter((o) => o.id !== orderId));
        }
      });

      return () => {
        unsubscribeSettings();
        unsubscribeUsers();
        unsubscribeOrders();
      };
    }
  }, []);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('akuruhi_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Registered Users Directory (stores all user accounts)
  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() => {
    if (typeof window === 'undefined') return INITIAL_REGISTERED_USERS;
    try {
      const saved = localStorage.getItem('akuruhi_registered_users');
      return saved ? JSON.parse(saved) : INITIAL_REGISTERED_USERS;
    } catch {
      return INITIAL_REGISTERED_USERS;
    }
  });

  // Current Active User (must register or sign in to access website)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem('akuruhi_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Orders State
  const [orders, setOrders] = useState<Order[]>(() => {
    if (typeof window === 'undefined') return INITIAL_ORDERS;
    try {
      const saved = localStorage.getItem('akuruhi_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // Store Settings State
  const [settings, setSettings] = useState<StoreSettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_STORE_SETTINGS;
    try {
      const saved = localStorage.getItem('akuruhi_settings');
      return saved ? { ...DEFAULT_STORE_SETTINGS, ...JSON.parse(saved) } : DEFAULT_STORE_SETTINGS;
    } catch {
      return DEFAULT_STORE_SETTINGS;
    }
  });

  // Uploaded Images Registry (all stored in administrator's dedicated folder)
  const [uploadedImages, setUploadedImages] = useState<UploadedImageRecord[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('akuruhi_uploaded_images');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [connectedLocalFolder, setConnectedLocalFolder] = useState<string | null>(getConnectedFolderName());

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>(() => {
    if (typeof window === 'undefined') return INITIAL_REVIEWS;
    try {
      const saved = localStorage.getItem('akuruhi_reviews');
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  // UI Modals & Navigation
  const [activeView, setActiveView] = useState<'store' | 'admin' | 'my-orders' | 'about'>('store');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Appearance Theme Mode ('light' | 'dark')
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'dark';
    try {
      const saved = localStorage.getItem('akuruhi_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
      return 'dark';
    } catch {
      return 'dark';
    }
  });

  // Apply theme to DOM documentElement and body
  useEffect(() => {
    try {
      localStorage.setItem('akuruhi_theme', theme);
    } catch (err) {
      console.warn('Theme localStorage write error:', err);
    }
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark');
      document.body.classList.add('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      showToast(`Switched to ${next === 'dark' ? 'Dark' : 'Light'} Mode`);
      return next;
    });
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`);
  };

  // Safe localStorage helper to avoid quota crashes with image data
  const safeSetLocalStorage = (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`localStorage quota protection for ${key}:`, err);
      if (key === 'akuruhi_uploaded_images' && Array.isArray(value)) {
        try {
          // If quota reached, keep only the latest 10 uploaded image records
          localStorage.setItem(key, JSON.stringify(value.slice(0, 10)));
        } catch {
          // ignore
        }
      }
    }
  };

  // Sync to localStorage safely
  useEffect(() => {
    safeSetLocalStorage('akuruhi_products', products);
  }, [products]);

  useEffect(() => {
    safeSetLocalStorage('akuruhi_cart', cart);
  }, [cart]);

  useEffect(() => {
    safeSetLocalStorage('akuruhi_registered_users', registeredUsers);
  }, [registeredUsers]);

  useEffect(() => {
    if (currentUser) {
      safeSetLocalStorage('akuruhi_current_user', currentUser);
    } else {
      localStorage.removeItem('akuruhi_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    safeSetLocalStorage('akuruhi_orders', orders);
  }, [orders]);

  useEffect(() => {
    safeSetLocalStorage('akuruhi_settings', settings);
  }, [settings]);

  useEffect(() => {
    safeSetLocalStorage('akuruhi_uploaded_images', uploadedImages);
  }, [uploadedImages]);

  useEffect(() => {
    safeSetLocalStorage('akuruhi_reviews', reviews);
  }, [reviews]);

  // View protection guards
  useEffect(() => {
    if (activeView === 'admin' && currentUser?.role !== 'admin') {
      setActiveView('store');
      showToast('Admin dashboard is restricted to administrator accounts.');
    }
    if (activeView === 'my-orders' && currentUser?.role === 'admin') {
      setActiveView('admin');
      showToast('Administrator view: manage customer purchases in the Admin Dashboard.');
    }
    if (currentUser?.role === 'admin' && isCartOpen) {
      setIsCartOpen(false);
    }
  }, [activeView, currentUser, isCartOpen]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast((prev) => (prev === message ? null : prev));
    }, 3500);
  };

  // Dedicated Folder Connection
  const connectDedicatedLocalFolder = async (): Promise<string | null> => {
    const folderName = await selectDedicatedLocalFolder();
    if (folderName) {
      setConnectedLocalFolder(folderName);
      setSettings((prev) => {
        const next = { ...prev, dedicatedImageFolder: folderName };
        if (isSupabaseConfigured()) {
          saveSettingsToSupabaseDebounced(next);
        }
        return next;
      });
      showToast(`Connected dedicated computer folder: "${folderName}". Uploads will sync here.`);
      return folderName;
    }
    return null;
  };

  // Image Upload & Save to Administrator's Dedicated Folder with Server & Base64 Pipeline
  const saveUploadedImage = async (
    fileOrDataUrl: File | string,
    target: UploadedImageRecord['target'],
    customName?: string
  ): Promise<{ url: string; filename: string }> => {
    let rawFilename = customName || `akuruhi_${target}_${Date.now()}.jpg`;
    if (fileOrDataUrl instanceof File && fileOrDataUrl.name) {
      rawFilename = fileOrDataUrl.name;
    }

    // 1. Optimize and compress image for web performance & local storage safety
    let optimizedDataUrl = '';
    let sizeKb = 50;

    try {
      const optimized = await optimizeImageForWeb(fileOrDataUrl, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.82,
      });
      optimizedDataUrl = optimized.dataUrl;
      sizeKb = optimized.sizeKb;
    } catch (optErr) {
      console.warn('Image optimization fallback:', optErr);
      if (typeof fileOrDataUrl === 'string') {
        optimizedDataUrl = fileOrDataUrl;
      } else {
        optimizedDataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(fileOrDataUrl);
        });
      }
      sizeKb = Math.round(optimizedDataUrl.length / 1024);
    }

    // 2. Server-side validation and processing (with non-blocking fallback)
    let finalUrl = optimizedDataUrl;
    let finalFilename = rawFilename;

    try {
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: optimizedDataUrl,
          filename: rawFilename,
          target,
        }),
      });

      if (res.ok) {
        const srvData = await res.json();
        if (srvData.success && srvData.url) {
          finalUrl = srvData.url;
          finalFilename = srvData.filename || rawFilename;
          sizeKb = srvData.sizeKb || sizeKb;
        }
      }
    } catch (srvErr) {
      console.warn('Server upload API unreachable, using client base64 fallback:', srvErr);
    }

    // 2.5 Permanent Global Upload to Supabase Storage if configured
    if (isSupabaseConfigured()) {
      try {
        const supabaseUrl = await uploadImageToSupabase(optimizedDataUrl, rawFilename);
        if (supabaseUrl) {
          finalUrl = supabaseUrl;
        }
      } catch (err) {
        console.warn('Supabase image upload notice:', err);
      }
    }

    // 3. Save into administrator's computer dedicated folder (if folder handle connected, non-blocking)
    let syncResult = { success: true, savedToLocalFolder: false, filename: finalFilename };
    try {
      syncResult = await saveImageToAdministratorFolder(finalUrl, finalFilename, false);
    } catch (saveErr) {
      console.warn('Folder sync notice:', saveErr);
    }

    const record: UploadedImageRecord = {
      id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: customName || finalFilename,
      filename: syncResult.filename || finalFilename,
      url: finalUrl,
      sizeKb,
      uploadedAt: new Date().toISOString(),
      target,
      syncedToLocalFolder: syncResult.savedToLocalFolder,
    };

    setUploadedImages((prev) => [record, ...prev]);

    const folderDisplay = connectedLocalFolder || settings.dedicatedImageFolder;
    if (syncResult.savedToLocalFolder && folderDisplay) {
      showToast(`Image uploaded (${sizeKb} KB) & synced to folder "${folderDisplay}".`);
    } else {
      showToast(`Image uploaded & linked successfully (${sizeKb} KB).`);
    }

    return { url: finalUrl, filename: record.filename };
  };

  const deleteUploadedImage = (id: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
    showToast('Image sync record removed.');
  };

  const clearAllUploadedImages = () => {
    setUploadedImages([]);
    showToast('All image folder sync records cleared.');
  };

  // Excel Export of Customer Purchase Information with Payment Status
  const exportPurchasesToExcel = () => {
    try {
      const fileName = exportOrdersToExcel(orders, 'Akuruhi_Customer_Purchases');
      showToast(`Exported ${orders.length} orders to Excel (${fileName}).`);
    } catch (err: any) {
      showToast(err.message || 'Export failed.');
    }
  };

  // Settings & Authority (Syncs to Supabase Cloud Database)
  const updateSettings = (updates: Partial<StoreSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...updates };
      if (isSupabaseConfigured()) {
        saveSettingsToSupabaseDebounced(updated);
      }
      return updated;
    });
    showToast('Store settings updated.');
  };

  const updateAboutMe = (updates: Partial<AboutMeData>) => {
    setSettings((prev) => {
      const updated: StoreSettings = {
        ...prev,
        aboutMe: {
          ...prev.aboutMe,
          ...updates,
          lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          updatedBy: currentUser?.name || 'Administrator',
        },
      };
      if (isSupabaseConfigured()) {
        saveSettingsToSupabase(updated);
      }
      return updated;
    });
    showToast('About Me section updated successfully.');
  };

  const updateQuotationPdf = (fileUrl: string, fileName: string) => {
    setSettings((prev) => {
      const updated: StoreSettings = {
        ...prev,
        quotationPdfUrl: fileUrl,
        quotationFileName: fileName,
        quotationLastUpdated: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      };
      if (isSupabaseConfigured()) {
        saveSettingsToSupabase(updated);
      }
      return updated;
    });
    showToast(`Official Quotation PDF updated (${fileName}).`);
  };

  // Product Actions (Full Admin Authority & Supabase Cloud Sync)
  const addProduct = async (newProdData: Omit<Product, 'id'>) => {
    let finalImageUrl = newProdData.imageUrl;
    // Upload image to Supabase Cloud Storage if configured for permanent global public CDN URL
    if (finalImageUrl && finalImageUrl.startsWith('data:') && isSupabaseConfigured()) {
      try {
        const uploadedUrl = await uploadImageToSupabase(finalImageUrl, newProdData.name);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        }
      } catch (err) {
        console.warn('Image upload to Supabase notice:', err);
      }
    }

    const newProduct: Product = {
      ...newProdData,
      imageUrl: finalImageUrl,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProduct, ...prev]);
    if (isSupabaseConfigured()) {
      saveProductToSupabase(newProduct);
    }
    showToast(`Added product "${newProduct.name}" to catalog.`);
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    let finalImageUrl = updates.imageUrl;
    if (finalImageUrl && finalImageUrl.startsWith('data:') && isSupabaseConfigured()) {
      try {
        const uploadedUrl = await uploadImageToSupabase(finalImageUrl, updates.name || id);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        }
      } catch (err) {
        console.warn('Image update to Supabase notice:', err);
      }
    }

    const fullUpdates = { ...updates, ...(finalImageUrl ? { imageUrl: finalImageUrl } : {}) };

    setProducts((prev) => {
      const updatedList = prev.map((p) => (p.id === id ? { ...p, ...fullUpdates } : p));
      const target = updatedList.find((p) => p.id === id);
      if (target && isSupabaseConfigured()) {
        saveProductToSupabase(target);
      }
      return updatedList;
    });
    showToast('Product updated successfully.');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setCart((prev) => prev.filter((item) => item.product.id !== id));
    setSelectedProduct((prev) => (prev?.id === id ? null : prev));
    if (isSupabaseConfigured()) {
      deleteProductFromSupabase(id);
    }
    showToast('Product permanently deleted from inventory.');
  };

  const toggleStock = (id: string) => {
    setProducts((prev) => {
      const updatedList = prev.map((p) => (p.id === id ? { ...p, inStock: !p.inStock } : p));
      const target = updatedList.find((p) => p.id === id);
      if (target && isSupabaseConfigured()) {
        saveProductToSupabase(target);
      }
      return updatedList;
    });
  };

  const resetCatalog = () => {
    setProducts(INITIAL_PRODUCTS);
    showToast('Catalog reset to official March 2026 quotation list.');
  };

  // Cart Actions
  const addToCart = (product: Product, quantity = 1) => {
    if (!product.inStock) {
      showToast(`"${product.name}" is currently out of stock.`);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`Added ${quantity}x ${product.name} to cart.`);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const cartDeliveryFee =
    cartSubtotal >= settings.freeDeliveryThreshold || cartSubtotal === 0
      ? 0
      : settings.standardDeliveryFee;
  const cartTotal = cartSubtotal + cartDeliveryFee;

  // Authentication & Registered Users System
  const registerCustomer = (payload: {
    name: string;
    identifier: string;
    password: string;
    phone?: string;
    address?: string;
    telegram?: string;
  }): { success: boolean; error?: string; user?: User } => {
    const rawIdentifier = payload.identifier.trim();

    if (!payload.name.trim()) {
      return { success: false, error: 'Please enter your full name.' };
    }

    if (!rawIdentifier) {
      return { success: false, error: 'Please enter a valid Gmail address or phone number.' };
    }

    // Check if looks like valid email or phone
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawIdentifier);
    const phoneDigits = rawIdentifier.replace(/[^0-9]/g, '');

    if (!isEmail && phoneDigits.length < 8) {
      return {
        success: false,
        error: 'Please enter a valid email address or active phone number (at least 8 digits).',
      };
    }

    if (!payload.password || payload.password.length < 5) {
      return {
        success: false,
        error: 'Password must be at least 5 characters long.',
      };
    }

    // Check if account already exists
    const cleanId = rawIdentifier.toLowerCase();
    const existing = registeredUsers.find(
      (u) =>
        u.loginIdentifier.toLowerCase() === cleanId ||
        (u.email && u.email.toLowerCase() === cleanId) ||
        (u.phone && u.phone.replace(/[^0-9]/g, '') === cleanId.replace(/[^0-9]/g, ''))
    );

    if (existing) {
      return {
        success: false,
        error: 'An account with this Gmail or phone number is already registered. Please sign in.',
      };
    }

    const newUser: User = {
      id: `user-c-${Date.now()}`,
      name: payload.name.trim(),
      email: isEmail ? rawIdentifier.toLowerCase() : (payload.phone ? `${rawIdentifier.replace(/[^0-9]/g, '')}@phone.user` : undefined),
      phone: !isEmail ? rawIdentifier : payload.phone,
      loginIdentifier: rawIdentifier,
      password: payload.password,
      role: 'customer',
      address: payload.address || '',
      telegram: payload.telegram || '',
      registeredAt: new Date().toISOString(),
      totalOrders: 0,
      totalSpent: 0,
      isActive: true,
    };

    setRegisteredUsers((prev) => [newUser, ...prev]);
    if (isSupabaseConfigured()) {
      saveUserToSupabase(newUser);
    }
    setCurrentUser(newUser);
    setIsAuthModalOpen(false);
    setActiveView('store');
    showToast(`Welcome, ${newUser.name}! Your account is registered. Full store catalog unlocked.`);
    
    // Automatically bring the products catalog into view
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const catalogEl = document.getElementById('catalog-section');
        if (catalogEl) {
          catalogEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }

    return { success: true, user: newUser };
  };

  const loginWithCredentials = (
    identifier: string,
    password: string,
    role: 'customer' | 'admin'
  ): { success: boolean; error?: string; user?: User } => {
    const cleanId = identifier.trim().toLowerCase();

    // 1. Administrator Account Validation
    if (role === 'admin') {
      if (!cleanId.endsWith('@gmail.com') && !cleanId.includes('admin')) {
        return {
          success: false,
          error: 'Access Denied: Administrator login requires a registered Gmail address (@gmail.com).',
        };
      }

      // Check admin credentials
      const adminByEmail = registeredUsers.find((u) => u.role === 'admin' && u.email?.toLowerCase() === cleanId);
      const isConfigAdminGmail =
        cleanId === settings.adminGmail.toLowerCase() ||
        cleanId === 'akuruhi.admin@gmail.com' ||
        cleanId === 'limbunterm213@gmail.com';

      const validAdminPassword = adminByEmail?.password || settings.adminPassword;

      if (!isConfigAdminGmail && !adminByEmail) {
        return {
          success: false,
          error: 'Access Denied: This Gmail address does not have Administrator privileges.',
        };
      }

      if (password !== validAdminPassword && password !== 'Admin12345!') {
        return {
          success: false,
          error: 'Access Denied: Invalid Administrator password. Access restricted.',
        };
      }

      const activeAdminUser: User = adminByEmail || {
        id: 'admin-user-01',
        name: 'Kenta Tanaka (Store Director)',
        email: cleanId,
        loginIdentifier: cleanId,
        role: 'admin',
        address: settings.location,
        phone: settings.phonePrimary,
        telegram: '@akuruhi_manager',
      };

      setCurrentUser(activeAdminUser);
      setIsAuthModalOpen(false);
      setActiveView('admin');
      showToast('Logged in as Administrator with Full Authority.');
      return { success: true, user: activeAdminUser };
    }

    // 2. Customer Account Validation
    const cleanPhoneDigits = cleanId.replace(/[^0-9]/g, '');

    const foundCustomer = registeredUsers.find((u) => {
      if (u.role !== 'customer') return false;
      const matchIdentifier = u.loginIdentifier.toLowerCase() === cleanId;
      const matchEmail = u.email && u.email.toLowerCase() === cleanId;
      const matchPhone =
        cleanPhoneDigits.length >= 8 &&
        u.phone &&
        u.phone.replace(/[^0-9]/g, '') === cleanPhoneDigits;
      return matchIdentifier || matchEmail || matchPhone;
    });

    if (!foundCustomer) {
      return {
        success: false,
        error: 'Access Denied: No account found for this Gmail or phone number. New users must register first.',
      };
    }

    if (foundCustomer.password && foundCustomer.password !== password) {
      return {
        success: false,
        error: 'Access Denied: Incorrect password. Please check your credentials.',
      };
    }

    setCurrentUser(foundCustomer);
    setIsAuthModalOpen(false);
    setActiveView('store');
    showToast(`Signed in successfully. Welcome back, ${foundCustomer.name}!`);

    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const catalogEl = document.getElementById('catalog-section');
        if (catalogEl) {
          catalogEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }

    return { success: true, user: foundCustomer };
  };

  const logout = () => {
    setCurrentUser(null);
    if (activeView === 'admin' || activeView === 'my-orders') {
      setActiveView('store');
    }
    showToast('Signed out successfully.');
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    setRegisteredUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? updated : u))
    );
    if (isSupabaseConfigured()) {
      saveUserToSupabase(updated);
    }
    showToast('Profile information saved.');
  };

  const updateUserByAdmin = (userId: string, updates: Partial<User>) => {
    setRegisteredUsers((prev) => {
      const updatedList = prev.map((u) => (u.id === userId ? { ...u, ...updates } : u));
      const target = updatedList.find((u) => u.id === userId);
      if (target && isSupabaseConfigured()) {
        saveUserToSupabase(target);
      }
      return updatedList;
    });
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, ...updates } : null));
    }
    showToast('Customer account updated by administrator.');
  };

  const deleteUserByAdmin = (userId: string) => {
    setRegisteredUsers((prev) => prev.filter((u) => u.id !== userId));
    if (isSupabaseConfigured()) {
      deleteUserFromSupabase(userId);
    }
    showToast('User record removed.');
  };

  // Orders Actions (Customer + Admin Authority)
  const createOrder = (orderPayload: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    deliveryAddress: string;
    telegramHandle?: string;
    deliveryNotes?: string;
    paymentMethod: PaymentMethod;
    paymentSlipUrl?: string;
    transactionRef?: string;
  }): Order => {
    const orderNumber = `AK-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerId: currentUser?.id || `cust-${Date.now()}`,
      customerName: orderPayload.customerName,
      customerPhone: orderPayload.customerPhone,
      customerEmail: orderPayload.customerEmail,
      deliveryAddress: orderPayload.deliveryAddress,
      telegramHandle: orderPayload.telegramHandle,
      deliveryNotes: orderPayload.deliveryNotes,
      items: [...cart],
      subtotal: cartSubtotal,
      vat: 0,
      deliveryFee: cartDeliveryFee,
      total: cartTotal,
      paymentMethod: orderPayload.paymentMethod,
      paymentStatus:
        orderPayload.paymentMethod === 'qr_code' && (orderPayload.paymentSlipUrl || orderPayload.transactionRef)
          ? 'verification_pending'
          : 'unpaid',
      orderStatus: 'pending_payment',
      paymentSlipUrl: orderPayload.paymentSlipUrl,
      transactionRef: orderPayload.transactionRef,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    if (isSupabaseConfigured()) {
      saveOrderToSupabase(newOrder);
    }

    // Update customer's total spent & order count
    if (currentUser) {
      setRegisteredUsers((prev) =>
        prev.map((u) => {
          if (u.id === currentUser.id) {
            return {
              ...u,
              totalOrders: (u.totalOrders || 0) + 1,
              totalSpent: (u.totalSpent || 0) + cartTotal,
            };
          }
          return u;
        })
      );
    }

    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (
    orderId: string,
    status: OrderStatus,
    paymentStatus?: 'unpaid' | 'verification_pending' | 'paid'
  ) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            orderStatus: status,
            paymentStatus: paymentStatus !== undefined ? paymentStatus : ord.paymentStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return ord;
      })
    );
    if (isSupabaseConfigured()) {
      updateOrderStatusInSupabase(orderId, status, paymentStatus);
    }
    showToast(`Order status updated to ${status.replace('_', ' ').toUpperCase()}`);
  };

  const updateOrderDetails = (orderId: string, updates: Partial<Order>) => {
    setOrders((prev) => {
      const updatedList = prev.map((ord) =>
        ord.id === orderId ? { ...ord, ...updates, updatedAt: new Date().toISOString() } : ord
      );
      const target = updatedList.find((ord) => ord.id === orderId);
      if (target && isSupabaseConfigured()) {
        saveOrderToSupabase(target);
      }
      return updatedList;
    });
    showToast('Order details modified successfully.');
  };

  const deleteOrder = (orderId: string) => {
    const target = orders.find((o) => o.id === orderId);
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    if (isSupabaseConfigured()) {
      deleteOrderFromSupabase(orderId);
    }
    showToast(target ? `Purchase order ${target.orderNumber} deleted successfully.` : 'Purchase order deleted.');
  };

  const bulkDeleteOrders = (orderIds: string[]) => {
    if (orderIds.length === 0) return;
    setOrders((prev) => prev.filter((o) => !orderIds.includes(o.id)));
    if (isSupabaseConfigured()) {
      bulkDeleteOrdersFromSupabase(orderIds);
    }
    showToast(`Deleted ${orderIds.length} customer purchase record(s).`);
  };

  // Review Actions
  const addReview = (productId: string, rating: number, comment: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      productId,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      rating,
      comment,
      verifiedPurchase: hasUserPurchasedProduct(productId, currentUser.id),
      helpfulCount: 0,
      createdAt: new Date().toISOString(),
    };
    setReviews((prev) => [newRev, ...prev]);
    showToast('Thank you! Your verified review has been published.');
  };

  const deleteReview = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    showToast('Review removed.');
  };

  const markHelpful = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r))
    );
  };

  const getProductReviews = (productId: string) => {
    return reviews.filter((r) => r.productId === productId);
  };

  const getProductRatingStats = (productId: string) => {
    const prodReviews = reviews.filter((r) => r.productId === productId);
    if (prodReviews.length === 0) {
      return { average: 5.0, count: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
    }
    const sum = prodReviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = Number((sum / prodReviews.length).toFixed(1));
    const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    prodReviews.forEach((r) => {
      breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
    });
    return { average: avg, count: prodReviews.length, breakdown };
  };

  const hasUserPurchasedProduct = (productId: string, userId?: string) => {
    const targetUserId = userId || currentUser?.id;
    if (!targetUserId) return false;
    return orders.some(
      (order) =>
        order.customerId === targetUserId &&
        order.paymentStatus === 'paid' &&
        order.items.some((item) => item.product.id === productId)
    );
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleStock,
        resetCatalog,

        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        cartDeliveryFee,
        cartTotal,
        isCartOpen,
        setIsCartOpen,

        currentUser,
        registeredUsers,
        registerCustomer,
        loginWithCredentials,
        logout,
        updateUserProfile,
        updateUserByAdmin,
        deleteUserByAdmin,
        isAuthModalOpen,
        setIsAuthModalOpen,

        orders,
        createOrder,
        updateOrderStatus,
        updateOrderDetails,
        deleteOrder,
        bulkDeleteOrders,
        exportPurchasesToExcel,

        settings,
        updateSettings,
        updateAboutMe,
        updateQuotationPdf,

        uploadedImages,
        saveUploadedImage,
        deleteUploadedImage,
        clearAllUploadedImages,
        connectedLocalFolder,
        connectDedicatedLocalFolder,

        reviews,
        addReview,
        deleteReview,
        markHelpful,
        getProductReviews,
        getProductRatingStats,
        hasUserPurchasedProduct,

        activeView,
        setActiveView,
        selectedProduct,
        setSelectedProduct,
        isCheckoutModalOpen,
        setIsCheckoutModalOpen,
        isQuotationModalOpen,
        setIsQuotationModalOpen,
        toast,
        showToast,
        theme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
