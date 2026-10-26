import { Review } from '../types';

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-101',
    productId: 'prod-w1', // Japanese Ribeye Wagyu A5
    userId: 'user-vuthy',
    userName: 'Chef Vuthy (Miki House)',
    userRole: 'customer',
    rating: 5,
    comment:
      'Exceptional snowflake marbling. We seared this on binchotan charcoal for our teppanyaki counter and the umami fat melted like butter. Authentic Kumamoto prefecture quality.',
    verifiedPurchase: true,
    helpfulCount: 9,
    createdAt: '2026-10-18T10:14:00Z',
  },
  {
    id: 'rev-102',
    productId: 'prod-w1', // Japanese Ribeye Wagyu A5
    userId: 'user-c1', // Sophia Sokha
    userName: 'Sophia Sokha',
    userRole: 'customer',
    rating: 5,
    comment:
      'Ordered for our family anniversary dinner in Phnom Penh. It arrived properly packed in dry cold sub-zero condition. The beef was so tender you could cut it with a fork!',
    verifiedPurchase: true,
    helpfulCount: 5,
    createdAt: '2026-10-21T15:20:00Z',
  },
  {
    id: 'rev-103',
    productId: 'prod-s1', // Hon Maguro Otoro
    userId: 'user-sushi-world',
    userName: 'Master Chef Sovath',
    userRole: 'customer',
    rating: 5,
    comment:
      'Pristine sashimi-grade otoro belly. Thawed according to Japanese saline method and the rich ruby-marbled luster came out immaculate. Our sashimi omakase guests were thrilled.',
    verifiedPurchase: true,
    helpfulCount: 7,
    createdAt: '2026-10-19T14:45:00Z',
  },
  {
    id: 'rev-104',
    productId: 'prod-bv1', // Dassai 23 Junmai Daiginjo
    userId: 'user-sommelier',
    userName: 'David Tan',
    userRole: 'customer',
    rating: 5,
    comment:
      'The 23% rice polishing ratio yields a legendary bouquet of honeydew melon, white peach, and velvet grace. Served chilled at 10°C, absolute perfection.',
    verifiedPurchase: true,
    helpfulCount: 6,
    createdAt: '2026-10-15T18:30:00Z',
  },
  {
    id: 'rev-105',
    productId: 'prod-sn2', // Yamasa Koikuchi Soy Sauce 1L
    userId: 'user-homechef',
    userName: 'Leakhena M.',
    userRole: 'customer',
    rating: 5,
    comment:
      'Our go-to dark soy sauce for both home dining and barbecue tare. Authentic deep brewed aroma that brings real restaurant flavor to homemade dishes.',
    verifiedPurchase: true,
    helpfulCount: 4,
    createdAt: '2026-10-12T09:10:00Z',
  },
  {
    id: 'rev-106',
    productId: 'prod-cr1', // S&B Golden Curry Spicy
    userId: 'user-c1',
    userName: 'Sophia Sokha',
    userRole: 'customer',
    rating: 5,
    comment:
      'Classic S&B spiced curry block. Perfect thickness and robust spice balance. We made katsu curry with pork loin and it was comforting and savory.',
    verifiedPurchase: true,
    helpfulCount: 3,
    createdAt: '2026-10-16T12:00:00Z',
  },
  {
    id: 'rev-107',
    productId: 'prod-s3', // Hokkaido Scallop Hotate
    userId: 'user-gourmet',
    userName: 'Kimberly Chen',
    userRole: 'customer',
    rating: 5,
    comment:
      'Very sweet, plump wild-caught Hokkaido scallops. We seared them lightly with salted butter and soy sauce. Truly fresh ocean taste.',
    verifiedPurchase: true,
    helpfulCount: 5,
    createdAt: '2026-10-20T17:10:00Z',
  },
];
