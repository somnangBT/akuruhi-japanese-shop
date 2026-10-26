import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  Wine,
  Sparkles,
  Utensils,
  Flame,
  Wheat,
  Snowflake,
  Package,
  Check,
  RotateCcw,
  Tag,
  Filter,
  DollarSign,
  Thermometer,
  Boxes,
} from 'lucide-react';
import { ProductCard } from './ProductCard';
import { useStore } from '../context/StoreContext';
import { ProductCategory, Product } from '../types';

interface CategoryOption {
  id: ProductCategory | 'all';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const CATEGORIES: CategoryOption[] = [
  {
    id: 'all',
    label: 'All Products',
    icon: Boxes,
    description: 'Complete March 2026 catalogue',
  },
  {
    id: 'beverages_sake',
    label: 'Beverages & Sake',
    icon: Wine,
    description: 'Dassai, Kubota, Asahi & green tea',
  },
  {
    id: 'seasoning',
    label: 'Sauces & Seasonings',
    icon: Sparkles,
    description: 'Kewpie mayo, soy sauce, mirin & dashi',
  },
  {
    id: 'pickled',
    label: 'Snacks & Pickles',
    icon: Utensils,
    description: 'Nori seaweed snacks, gari & appetisers',
  },
  {
    id: 'frozen',
    label: 'Frozen Wagyu & Seafood',
    icon: Snowflake,
    description: 'A5 Kumamoto Wagyu & Toyosu bluefin',
  },
  {
    id: 'curry',
    label: 'Japanese Curry',
    icon: Flame,
    description: 'S&B Golden, Java & Vermont curry roux',
  },
  {
    id: 'noodles_rice',
    label: 'Rice & Noodles',
    icon: Wheat,
    description: 'Akuruhi sushi rice, udon & ramen',
  },
];

// Quick Type tags for high-frequency user searches
interface QuickTypeFilter {
  id: string;
  label: string;
  matcher: (p: Product) => boolean;
}

const QUICK_TYPES: QuickTypeFilter[] = [
  {
    id: 'all',
    label: 'All Types',
    matcher: () => true,
  },
  {
    id: 'beverage',
    label: 'Beverage & Drinks',
    matcher: (p) =>
      p.category === 'beverages_sake' ||
      /sake|beer|tea|beverage|drink|choya|asahi|kirin|dassai/i.test(p.name + p.description),
  },
  {
    id: 'sauce',
    label: 'Sauce & Seasoning',
    matcher: (p) =>
      p.category === 'seasoning' ||
      /sauce|seasoning|mayo|kewpie|soy sauce|mirin|dressing|vinegar/i.test(p.name + p.description),
  },
  {
    id: 'snack',
    label: 'Snack & Appetiser',
    matcher: (p) =>
      p.category === 'pickled' ||
      /snack|seaweed|nori|ginger|gari|pickle|edamame|appetizer/i.test(p.name + p.description),
  },
  {
    id: 'wagyu',
    label: 'Wagyu & Beef',
    matcher: (p) => /wagyu|ribeye|sirloin|beef|steak/i.test(p.name + p.description),
  },
  {
    id: 'seafood',
    label: 'Sashimi & Seafood',
    matcher: (p) =>
      /otoro|maguro|tuna|sashimi|salmon|scallop|unagi|fish/i.test(p.name + p.description),
  },
  {
    id: 'rice_noodles',
    label: 'Rice & Noodles',
    matcher: (p) =>
      p.category === 'noodles_rice' ||
      /rice|udon|soba|ramen|noodle/i.test(p.name + p.description),
  },
  {
    id: 'curry',
    label: 'Japanese Curry',
    matcher: (p) =>
      p.category === 'curry' || /curry/i.test(p.name + p.description),
  },
];

export const ProductCatalog: React.FC = () => {
  const { products, settings } = useStore();

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [selectedQuickType, setSelectedQuickType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [temperatureFilter, setTemperatureFilter] = useState<'all' | 'Frozen' | 'Chilled' | 'Room Temperature'>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [priceTier, setPriceTier] = useState<'all' | 'under25' | '25to50' | '50to100' | 'over100'>('all');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'name'>('default');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Dynamic Category Counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Dynamic Quick Type Counts
  const quickTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    QUICK_TYPES.forEach((qt) => {
      counts[qt.id] = products.filter(qt.matcher).length;
    });
    return counts;
  }, [products]);

  // Dynamic Temperature Counts
  const temperatureCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach((p) => {
      if (p.storageTemp) {
        counts[p.storageTemp] = (counts[p.storageTemp] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  // Extract Top Brands dynamically
  const availableBrands = useMemo(() => {
    const brandMap: Record<string, number> = {};
    products.forEach((p) => {
      if (p.brand) {
        brandMap[p.brand] = (brandMap[p.brand] || 0) + 1;
      }
    });
    return Object.entries(brandMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [products]);

  // Active filters counter
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (selectedQuickType !== 'all') count++;
    if (searchQuery.trim()) count++;
    if (temperatureFilter !== 'all') count++;
    if (selectedBrand !== 'all') count++;
    if (priceTier !== 'all') count++;
    if (onlyInStock) count++;
    return count;
  }, [
    selectedCategory,
    selectedQuickType,
    searchQuery,
    temperatureFilter,
    selectedBrand,
    priceTier,
    onlyInStock,
  ]);

  const resetAllFilters = () => {
    setSelectedCategory('all');
    setSelectedQuickType('all');
    setSearchQuery('');
    setTemperatureFilter('all');
    setSelectedBrand('all');
    setPriceTier('all');
    setOnlyInStock(false);
    setSortBy('default');
  };

  // Filter and Sort Pipeline
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // 1. Category Filter
        if (selectedCategory !== 'all' && p.category !== selectedCategory) {
          return false;
        }

        // 2. Quick Type Filter (e.g., Beverage, Sauce, Snack)
        if (selectedQuickType !== 'all') {
          const typeMatcher = QUICK_TYPES.find((qt) => qt.id === selectedQuickType);
          if (typeMatcher && !typeMatcher.matcher(p)) {
            return false;
          }
        }

        // 3. In-stock Filter
        if (onlyInStock && !p.inStock) {
          return false;
        }

        // 4. Storage Temperature Filter
        if (temperatureFilter !== 'all' && p.storageTemp !== temperatureFilter) {
          return false;
        }

        // 5. Brand Filter
        if (selectedBrand !== 'all' && p.brand !== selectedBrand) {
          return false;
        }

        // 6. Price Tier Filter
        if (priceTier === 'under25' && p.price >= 25) return false;
        if (priceTier === '25to50' && (p.price < 25 || p.price > 50)) return false;
        if (priceTier === '50to100' && (p.price < 50 || p.price > 100)) return false;
        if (priceTier === 'over100' && p.price < 100) return false;

        // 7. Search Text Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchJp = p.nameJp?.toLowerCase().includes(q) || false;
          const matchKh = p.nameKhmer?.toLowerCase().includes(q) || false;
          const matchBrand = p.brand.toLowerCase().includes(q);
          const matchCode = p.code.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          if (!matchName && !matchJp && !matchKh && !matchBrand && !matchCode && !matchDesc) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [
    products,
    selectedCategory,
    selectedQuickType,
    searchQuery,
    temperatureFilter,
    selectedBrand,
    priceTier,
    onlyInStock,
    sortBy,
  ]);

  // Sidebar Component markup (shared between desktop sticky sidebar and mobile modal)
  const FilterSidebarContent = (
    <div className="space-y-6 text-xs">
      {/* Header & Reset Button */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-rose-500" />
          <span className="font-display font-bold text-sm text-slate-900 dark:text-white">Categories & Filters</span>
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={resetAllFilters}
            className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset ({activeFiltersCount})</span>
          </button>
        )}
      </div>

      {/* 1. Dynamic Product Categories */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 text-[11px] uppercase tracking-wider font-semibold">
          <span>Categories</span>
          <span className="font-mono text-slate-400 dark:text-neutral-500">{products.length} Items</span>
        </div>

        <div className="space-y-1">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const count = categoryCounts[cat.id] || 0;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  if (cat.id !== 'all') {
                    // Reset sub-type if moving to specific category
                    setSelectedQuickType('all');
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all group cursor-pointer ${
                  isSelected
                    ? 'bg-rose-50 dark:bg-rose-600/15 border border-rose-300 dark:border-rose-500/40 text-rose-900 dark:text-white shadow-xs font-semibold'
                    : 'bg-slate-50 hover:bg-slate-100 dark:bg-neutral-900/60 dark:hover:bg-neutral-900 border border-slate-200 dark:border-neutral-850 dark:hover:border-neutral-750 text-slate-700 dark:text-neutral-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-200 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 group-hover:text-slate-900 dark:group-hover:text-neutral-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <span className="font-medium text-xs block truncate">{cat.label}</span>
                    <span className="text-[10px] text-slate-500 dark:text-neutral-500 block truncate">
                      {cat.description}
                    </span>
                  </div>
                </div>

                <span
                  className={`font-mono text-[11px] px-2 py-0.5 rounded-full shrink-0 tabular-nums ml-2 font-medium ${
                    isSelected
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/30 dark:text-rose-200 font-bold'
                      : 'bg-slate-200 text-slate-600 dark:bg-neutral-800/80 dark:text-neutral-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Quick Item Type Filter */}
      <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-neutral-850">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-neutral-400 text-[11px] uppercase tracking-wider font-semibold">
          <Tag className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
          <span>Quick Type Filter</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-neutral-500 leading-tight">
          Quickly isolate items by practical culinary type:
        </p>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {QUICK_TYPES.map((qt) => {
            const count = quickTypeCounts[qt.id] || 0;
            const isSelected = selectedQuickType === qt.id;

            return (
              <button
                key={qt.id}
                type="button"
                onClick={() => setSelectedQuickType(qt.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all font-medium cursor-pointer ${
                  isSelected
                    ? 'bg-rose-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-neutral-900 dark:hover:bg-neutral-850 text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-neutral-800'
                }`}
              >
                <span>{qt.label}</span>
                <span
                  className={`text-[10px] font-mono px-1 rounded ${
                    isSelected ? 'bg-black/30 text-white' : 'text-slate-500 dark:text-neutral-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Storage Temperature Filter */}
      <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-neutral-850">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-neutral-400 text-[11px] uppercase tracking-wider font-semibold">
          <Thermometer className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
          <span>Storage Temperature</span>
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          {(
            [
              { id: 'all', label: 'All Temperatures' },
              { id: 'Frozen', label: 'Frozen (-20°C)' },
              { id: 'Chilled', label: 'Chilled (0-4°C)' },
              { id: 'Room Temperature', label: 'Ambient / Room Temp' },
            ] as const
          ).map((temp) => {
            const isSelected = temperatureFilter === temp.id;
            const count =
              temp.id === 'all'
                ? products.length
                : temperatureCounts[temp.id] || 0;

            return (
              <button
                key={temp.id}
                type="button"
                onClick={() => setTemperatureFilter(temp.id)}
                className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-sky-100 border border-sky-300 text-sky-900 dark:bg-sky-950/40 dark:border-sky-500/40 dark:text-sky-300 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-900'
                }`}
              >
                <span>{temp.label}</span>
                <span className="font-mono text-[10px] text-slate-400 dark:text-neutral-500">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Price Tier Filter */}
      <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-neutral-850">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-neutral-400 text-[11px] uppercase tracking-wider font-semibold">
          <DollarSign className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
          <span>Price Range</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'all', label: 'Any Price' },
            { id: 'under25', label: '< $25' },
            { id: '25to50', label: '$25 - $50' },
            { id: '50to100', label: '$50 - $100' },
            { id: 'over100', label: '$100+' },
          ].map((tier) => (
            <button
              key={tier.id}
              type="button"
              onClick={() => setPriceTier(tier.id as any)}
              className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors text-center cursor-pointer ${
                priceTier === tier.id
                  ? 'bg-emerald-100 border border-emerald-300 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-500/40 dark:text-emerald-300 font-semibold'
                  : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200 dark:bg-neutral-900 dark:border-neutral-850 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. In-Stock Availability Toggle */}
      <div className="pt-3 border-t border-slate-200 dark:border-neutral-850">
        <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-neutral-900 dark:hover:bg-neutral-850 border border-slate-200 dark:border-neutral-800 cursor-pointer transition-colors select-none">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                onlyInStock ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400 dark:bg-neutral-600'
              }`}
            />
            <span className="text-slate-800 dark:text-neutral-200 font-medium">In-Stock Only</span>
          </div>
          <input
            type="checkbox"
            checked={onlyInStock}
            onChange={(e) => setOnlyInStock(e.target.checked)}
            className="rounded accent-rose-600 w-4 h-4 cursor-pointer"
          />
        </label>
      </div>

      {/* 6. Top Brands Filter */}
      <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-neutral-850">
        <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 text-[11px] uppercase tracking-wider font-semibold">
          <span>Top Japanese Brands</span>
          {selectedBrand !== 'all' && (
            <button
              onClick={() => setSelectedBrand('all')}
              className="text-[10px] text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {availableBrands.map(([brand, count]) => {
            const isSelected = selectedBrand === brand;
            return (
              <button
                key={brand}
                type="button"
                onClick={() => setSelectedBrand(isSelected ? 'all' : brand)}
                className={`px-2 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-rose-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-400 dark:hover:text-white dark:border-neutral-800'
                }`}
              >
                {brand} ({count})
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <section id="catalog-section" className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Banner: Collection Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8 pb-6 border-b border-slate-200 dark:border-neutral-850">
        <div>
          <div
            style={{ color: settings.brandColor || '#e11d48' }}
            className="text-xs font-bold tracking-widest uppercase mb-1 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>March 2026 Direct Import Catalogue</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Wholesale & Retail Product Catalog
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 mt-1.5 max-w-2xl leading-relaxed">
            Direct air and ocean freight from Tokyo Toyosu Market with authentic Japanese batch codes, cold-chain assurance, and instant order dispatch in Phnom Penh.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search Wagyu, Dassai, M2001, Sauce..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-base sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Filters Toggle Strip (Visible on mobile/tablet screens) */}
      <div className="lg:hidden flex items-center justify-between gap-3 mb-6 p-3 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs">
        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-slate-800 dark:text-white text-xs font-semibold transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-rose-500" />
          <span>Category Sidebar & Filters</span>
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-mono text-[10px] flex items-center justify-center font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>

        <span className="font-mono text-xs text-slate-500 dark:text-neutral-400 tabular-nums">
          {filteredProducts.length} items found
        </span>
      </div>

      {/* Mobile Drawer Backdrop & Modal */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md lg:hidden">
          <div className="relative w-full max-w-md bg-white dark:bg-[#12151d] rounded-2xl border border-slate-200 dark:border-neutral-750 p-6 max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            <button
              onClick={() => setIsMobileFiltersOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {FilterSidebarContent}

            <div className="pt-4 border-t border-slate-200 dark:border-neutral-800">
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md cursor-pointer"
              >
                View Results ({filteredProducts.length} Items)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid Layout: Sidebar on Left + Products Grid on Right */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* DESKTOP SIDEBAR - Sticky beneath fixed top header */}
        <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-[116px] p-5 rounded-2xl bg-white dark:bg-[#11141b] border border-slate-200 dark:border-neutral-800 shadow-sm dark:shadow-xl space-y-6">
          {FilterSidebarContent}
        </aside>

        {/* PRODUCTS MAIN CONTENT AREA */}
        <div className="flex-1 min-w-0 w-full space-y-5">
          {/* Active Filter Tags & Sort Control Strip */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#11141c] border border-slate-200 dark:border-neutral-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Active Criteria Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400 dark:text-neutral-500 font-mono text-[11px]">Active View:</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-neutral-800 text-slate-800 dark:text-white font-medium text-xs">
                {selectedCategory === 'all'
                  ? 'All Categories'
                  : CATEGORIES.find((c) => c.id === selectedCategory)?.label}
              </span>

              {selectedQuickType !== 'all' && (
                <span className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60 font-medium text-xs flex items-center gap-1">
                  <span>Type: {QUICK_TYPES.find((q) => q.id === selectedQuickType)?.label}</span>
                  <button onClick={() => setSelectedQuickType('all')} className="cursor-pointer">
                    <X className="w-3 h-3 hover:text-rose-900 dark:hover:text-white" />
                  </button>
                </span>
              )}

              {temperatureFilter !== 'all' && (
                <span className="px-2.5 py-1 rounded-md bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/60 text-xs flex items-center gap-1">
                  <span>Temp: {temperatureFilter}</span>
                  <button onClick={() => setTemperatureFilter('all')} className="cursor-pointer">
                    <X className="w-3 h-3 hover:text-sky-900 dark:hover:text-white" />
                  </button>
                </span>
              )}

              {selectedBrand !== 'all' && (
                <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60 text-xs flex items-center gap-1">
                  <span>Brand: {selectedBrand}</span>
                  <button onClick={() => setSelectedBrand('all')} className="cursor-pointer">
                    <X className="w-3 h-3 hover:text-amber-900 dark:hover:text-white" />
                  </button>
                </span>
              )}

              {onlyInStock && (
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60 text-[11px]">
                  In Stock Only
                </span>
              )}

              {activeFiltersCount > 0 && (
                <button
                  onClick={resetAllFilters}
                  className="text-xs text-slate-500 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-rose-400 underline ml-1 cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Sort & Count */}
            <div className="flex items-center gap-2 ml-auto">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
              <span className="text-slate-500 dark:text-neutral-500">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-750 text-slate-800 dark:text-neutral-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-rose-500"
              >
                <option value="default">Default Catalogue</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name">Alphabetical</option>
              </select>

              <span className="font-mono text-slate-500 dark:text-neutral-400 ml-2 tabular-nums">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center rounded-2xl bg-slate-100/60 dark:bg-neutral-900/40 border border-slate-200 dark:border-neutral-800 p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-neutral-800 text-slate-500 dark:text-neutral-500 flex items-center justify-center mx-auto">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No products match your criteria</h3>
              <p className="text-xs text-slate-600 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
                No items found for the selected category, type filter, or search query. Try clearing your filters to see more results.
              </p>
              <button
                onClick={resetAllFilters}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-slate-800 dark:text-neutral-200 text-xs font-semibold border border-slate-300 dark:border-neutral-700 transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
