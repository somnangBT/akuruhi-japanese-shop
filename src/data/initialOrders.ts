import { Order } from '../types';
import { INITIAL_PRODUCTS } from './initialProducts';

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'AK-2026-8801',
    customerId: 'user-c1',
    customerName: 'Sophia Sokha',
    customerPhone: '+855 12 345 678',
    customerEmail: 'sophia.sokha@gmail.com',
    deliveryAddress: 'No. 88, Street 240, Daun Penh, Phnom Penh',
    telegramHandle: '@sophia_sokha',
    deliveryNotes: 'Please call upon arrival. Keep frozen items chilled.',
    items: [
      {
        product: INITIAL_PRODUCTS[0], // Wagyu A5 Ribeye
        quantity: 2,
      },
      {
        product: INITIAL_PRODUCTS[20], // Dassai 23
        quantity: 1,
      },
    ],
    subtotal: 350.0,
    vat: 0,
    deliveryFee: 0,
    total: 350.0,
    paymentMethod: 'qr_code',
    paymentStatus: 'paid',
    orderStatus: 'processing',
    transactionRef: 'ABA-REF-99218274',
    createdAt: '2026-10-23T14:30:00Z',
    updatedAt: '2026-10-23T15:10:00Z',
  },
  {
    id: 'ord-1002',
    orderNumber: 'AK-2026-8802',
    customerId: 'user-c2',
    customerName: 'Chef Vuthy (Miki House)',
    customerPhone: '0971234567',
    customerEmail: 'vuthy.chef@gmail.com',
    deliveryAddress: 'Preah Monivong Blvd, Boeung Keng Kang 1, Phnom Penh',
    telegramHandle: '@chef_vuthy',
    deliveryNotes: 'Urgent for dinner service tonight.',
    items: [
      {
        product: INITIAL_PRODUCTS[2], // Bluefin Otoro
        quantity: 1,
      },
      {
        product: INITIAL_PRODUCTS[16], // Akuruhi Rice 5kg
        quantity: 4,
      },
      {
        product: INITIAL_PRODUCTS[10], // Kewpie Mayo
        quantity: 2,
      },
    ],
    subtotal: 170.0,
    vat: 0,
    deliveryFee: 0,
    total: 170.0,
    paymentMethod: 'telegram',
    paymentStatus: 'verification_pending',
    orderStatus: 'pending_payment',
    createdAt: '2026-10-23T19:15:00Z',
    updatedAt: '2026-10-23T19:15:00Z',
  },
];
