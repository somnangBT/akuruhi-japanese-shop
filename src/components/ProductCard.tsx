import React from 'react';
import { Plus, Eye, Check, Star } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, setSelectedProduct, cart, getProductRatingStats, settings, currentUser } = useStore();

  const cartItem = cart.find((item) => item.product.id === product.id);
  const cartQty = cartItem?.quantity || 0;
  const stats = getProductRatingStats(product.id);

  const handleCardClick = () => {
    setSelectedProduct(product);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group flex flex-col h-full bg-white dark:bg-[#11141a] rounded-2xl border border-slate-200/90 dark:border-neutral-800/80 hover:border-slate-300 dark:hover:border-neutral-700 transition-all duration-200 overflow-hidden shadow-xs hover:shadow-xl hover:shadow-slate-300/40 dark:hover:shadow-2xl dark:hover:shadow-black/60 cursor-pointer relative"
    >
      {/* Product Image Slot */}
      <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-neutral-900 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Fallback container if image fails or doesn't load */}
        <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-neutral-850 dark:to-neutral-900 text-slate-500 dark:text-neutral-500">
          <span className="font-display font-bold text-2xl text-slate-700 dark:text-neutral-700">{product.code}</span>
          <span className="text-xs text-slate-500 dark:text-neutral-400 mt-1">{product.brand}</span>
        </div>

        {/* Storage Temp indicator & Stock status */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-medium pointer-events-none">
          {product.storageTemp && (
            <span
              className={`px-2 py-0.5 rounded text-[10px] tracking-wide font-medium backdrop-blur-md ${
                product.storageTemp === 'Frozen'
                  ? 'bg-sky-100/90 text-sky-800 border border-sky-300/60 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-800/40'
                  : product.storageTemp === 'Chilled'
                  ? 'bg-cyan-100/90 text-cyan-800 border border-cyan-300/60 dark:bg-cyan-950/80 dark:text-cyan-300 dark:border-cyan-800/40'
                  : 'bg-slate-100/90 text-slate-800 border border-slate-300/60 dark:bg-neutral-900/80 dark:text-neutral-300 dark:border-neutral-700/40'
              }`}
            >
              {product.storageTemp}
            </span>
          )}

          {!product.inStock && (
            <span className="px-2 py-0.5 rounded text-[10px] bg-red-100 text-red-700 border border-red-300 dark:bg-red-950/90 dark:text-red-300 dark:border-red-800/60 ml-auto font-semibold">
              Out of Stock
            </span>
          )}
        </div>

        {/* Quick View Overlay Button on Image Hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/95 dark:bg-neutral-900/95 text-slate-900 dark:text-white text-xs font-semibold border border-slate-200 dark:border-neutral-700 shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-all">
            <Eye className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Click to View Specs & Details</span>
          </div>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-1">
        {/* Metadata */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400 mb-1.5 font-mono">
          <span style={{ color: settings.brandColor || '#e11d48' }} className="font-semibold">
            {product.code}
          </span>
          <span className="text-slate-300 dark:text-neutral-600">·</span>
          <span className="truncate">{product.brand}</span>
          <span className="text-slate-300 dark:text-neutral-600">·</span>
          <span className="text-slate-500 dark:text-neutral-400 truncate">{product.unit}</span>
        </div>

        {/* Product Title */}
        <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-1 mb-1 text-base tracking-tight">
          {product.name}
        </h3>

        {/* Japanese & Khmer Subtitle */}
        {(product.nameJp || product.nameKhmer) && (
          <p className="text-xs text-slate-500 dark:text-neutral-500 mb-1.5 truncate">
            {product.nameJp} {product.nameKhmer ? `· ${product.nameKhmer}` : ''}
          </p>
        )}

        {/* Rating and Reviews Counter */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400 mb-2">
          <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-mono font-bold text-slate-800 dark:text-white text-xs tabular-nums">
              {stats.count > 0 ? stats.average.toFixed(1) : '5.0'}
            </span>
          </div>
          <span className="text-slate-300 dark:text-neutral-600">·</span>
          <span className="text-[11px] text-slate-500 dark:text-neutral-400">
            {stats.count > 0 ? `${stats.count} reviews` : 'New arrival'}
          </span>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-slate-600 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-4 flex-1">
          {product.description}
        </p>

        {/* Price & Action Module */}
        <div className="pt-3 border-t border-slate-100 dark:border-neutral-850 flex items-center justify-between gap-2 mt-auto">
          <div>
            <div className="font-mono text-lg font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
              ${product.price.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-neutral-500">
              per {product.unit} (excl. VAT)
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Dedicated Quick Specs Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedProduct(product);
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-850 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-neutral-700/80 transition-colors cursor-pointer"
              title="Click to view product details and specifications"
              aria-label={`View details for ${product.name}`}
            >
              <Eye className="w-4 h-4 text-slate-600 dark:text-neutral-300 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors" />
            </button>

            {/* For Admin Account: Specs & Details button. For Customer: Add to Cart CTA */}
            {currentUser?.role === 'admin' ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProduct(product);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
                title="View product specifications"
              >
                <Eye className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>View Specs</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product, 1);
                }}
                disabled={!product.inStock}
                style={
                  !product.inStock
                    ? undefined
                    : cartQty > 0
                    ? { borderColor: `${settings.brandColor || '#e11d48'}60`, color: settings.brandColor || '#e11d48' }
                    : { backgroundColor: settings.brandColor || '#e11d48' }
                }
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95 whitespace-nowrap cursor-pointer ${
                  !product.inStock
                    ? 'bg-slate-200 text-slate-400 dark:bg-neutral-800 dark:text-neutral-500 cursor-not-allowed'
                    : cartQty > 0
                    ? 'bg-rose-50 dark:bg-neutral-800 border hover:bg-rose-100 dark:hover:bg-neutral-750'
                    : 'text-white shadow-sm shadow-rose-950/20 hover:opacity-90'
                }`}
              >
                {cartQty > 0 ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{cartQty} in Cart</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
