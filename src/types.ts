export type ProductCategory =
  | 'seasoning'
  | 'curry'
  | 'pickled'
  | 'noodles_rice'
  | 'frozen'
  | 'beverages_sake';

export interface Product {
  id: string;
  code: string;
  name: string;
  nameJp?: string;
  nameKhmer?: string;
  category: ProductCategory;
  price: number;
  unit: string;
  brand: string;
  description: string;
  imageUrl: string;
  inStock: boolean;
  featured?: boolean;
  storageTemp?: 'Frozen' | 'Chilled' | 'Room Temperature';
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userRole?: 'customer' | 'admin';
  rating: number; // 1 to 5
  comment: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email?: string; // Gmail address (e.g. user@gmail.com)
  phone?: string; // Phone number (e.g. +855 12 345 678)
  loginIdentifier: string; // The primary Gmail or phone number used for login
  password?: string; // Credential for authentication
  role: 'customer' | 'admin';
  address: string;
  telegram?: string;
  registeredAt?: string;
  totalOrders?: number;
  totalSpent?: number;
  isActive?: boolean;
}

export type OrderStatus =
  | 'pending_payment'
  | 'verification_pending'
  | 'confirmed'
  | 'processing'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled';

export type PaymentMethod = 'qr_code' | 'telegram';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  telegramHandle?: string;
  deliveryNotes?: string;
  items: CartItem[];
  subtotal: number;
  vat: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'unpaid' | 'verification_pending' | 'paid';
  orderStatus: OrderStatus;
  paymentSlipUrl?: string;
  transactionRef?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AboutMeData {
  heroTitle: string;
  heroSubtitle: string;
  storyHeadline: string;
  storyParagraphs: string[];
  mission: string;
  vision: string;
  founderName: string;
  founderTitle: string;
  founderQuote: string;
  establishedYear: string;
  headquarters: string;
  facilityHighlights: string[];
  showrooms: {
    name: string;
    address: string;
    phone: string;
    hours: string;
  }[];
  coreValues: {
    title: string;
    description: string;
    icon: string;
  }[];
  bannerImageUrl?: string;
  founderImageUrl?: string;
  lastUpdated?: string;
  updatedBy?: string;
}

export interface UploadedImageRecord {
  id: string;
  name: string;
  filename: string;
  url: string;
  sizeKb: number;
  uploadedAt: string;
  target: 'product' | 'logo' | 'background' | 'qr_code' | 'quotation' | 'about_me' | 'general';
  syncedToLocalFolder?: boolean;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  logoUrl?: string;
  logoText?: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBadgeText: string;
  backgroundImageUrl: string;
  backgroundScope: 'hero_only' | 'entire_store';
  backgroundDarkness: number; // 0 to 1 (e.g. 0.75)
  backgroundBlur: number; // 0 to 20 px
  operatingHours: string;
  location: string;
  companyName: string;
  phonePrimary: string;
  phoneSecondary: string;
  telegramUsername: string;
  telegramDirectUrl: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  khqrMerchantId: string;
  qrImageUrl?: string;
  freeDeliveryThreshold: number;
  standardDeliveryFee: number;
  announcementText: string;
  partnerBrands: string[];
  brandColor?: string;
  brandColorHover?: string;

  // New administration & file management settings
  adminGmail: string;
  adminPassword: string;
  quotationPdfUrl: string;
  quotationFileName: string;
  quotationLastUpdated: string;
  dedicatedImageFolder: string;
  aboutMe: AboutMeData;
  themeMode?: 'light' | 'dark' | 'system';

  // Footer customization settings
  footerDescription?: string;
  footerBrandPartnersTitle?: string;
  footerShowPartnerLogos?: boolean;
  footerNavigationTitle?: string;
  footerSupportTitle?: string;
  footerSupportText?: string;
  footerCopyright?: string;
  footerLocationTag?: string;
}
