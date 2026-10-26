import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  Send,
  Star,
  ThumbsUp,
  CheckCircle2,
  Trash2,
  MessageSquare,
  ShieldCheck,
  Box,
  Thermometer,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

const RATING_LABELS: Record<number, string> = {
  1: 'Poor Quality',
  2: 'Below Average',
  3: 'Good / Standard',
  4: 'Very Good Quality',
  5: 'Exceptional / Gourmet Quality',
};

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProduct,
    setSelectedProduct,
    addToCart,
    settings,
    currentUser,
    setActiveView,
    setIsAuthModalOpen,
    getProductReviews,
    getProductRatingStats,
    addReview,
    deleteReview,
    markHelpful,
    hasUserPurchasedProduct,
  } = useStore();

  const [quantity, setQuantity] = useState(1);

  // Review Form State
  const [newRating, setNewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [newComment, setNewComment] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest'>('recent');

  const reviews = selectedProduct ? getProductReviews(selectedProduct.id) : [];
  const stats = selectedProduct
    ? getProductRatingStats(selectedProduct.id)
    : { average: 5.0, count: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
  const isVerifiedBuyer =
    currentUser && selectedProduct
      ? hasUserPurchasedProduct(selectedProduct.id, currentUser.id)
      : false;

  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'lowest') return a.rating - b.rating;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [reviews, sortBy]);

  if (!selectedProduct) return null;

  const handleAddToCart = () => {
    addToCart(selectedProduct, quantity);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addReview(selectedProduct.id, newRating, newComment);
    setNewComment('');
  };

  const telegramInquiryUrl = `${settings.telegramDirectUrl}?text=${encodeURIComponent(
    `Hello Akuruhi Cambodia! I am interested in wholesale/bulk order for: ${selectedProduct.name} (Code: ${selectedProduct.code}, Unit: ${selectedProduct.unit}, Price: $${selectedProduct.price}).`
  )}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl bg-white dark:bg-[#12151c] rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col text-slate-900 dark:text-neutral-100"
        >
          {/* Close Button */}
          <button
            onClick={() => setSelectedProduct(null)}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-neutral-900/80 dark:hover:bg-neutral-800 text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white border border-slate-200 dark:border-neutral-700/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Scrollable Container */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-200 dark:divide-neutral-800">
            {/* Top Section: Imagery & Contiguous Purchase Module */}
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Product Image */}
              <div className="relative aspect-[4/3] md:aspect-auto bg-slate-100 dark:bg-neutral-900 overflow-hidden min-h-[300px] md:min-h-full">
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                  {selectedProduct.storageTemp && (
                    <span className="px-2.5 py-1 rounded bg-white/90 dark:bg-black/75 backdrop-blur-md text-xs font-medium text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800/50 shadow-xs">
                      {selectedProduct.storageTemp} Storage
                    </span>
                  )}
                  {selectedProduct.featured && (
                    <span className="px-2.5 py-1 rounded bg-rose-50/90 dark:bg-rose-950/80 backdrop-blur-md text-xs font-medium text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800/50 shadow-xs">
                      Premium Selection
                    </span>
                  )}
                </div>
              </div>

              {/* Contiguous Purchase Module */}
              <div className="p-6 sm:p-8 flex flex-col">
                {/* Unboxed Metadata Header */}
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-neutral-400 mb-2">
                  <span className="text-rose-600 dark:text-rose-400 font-bold">{selectedProduct.code}</span>
                  <span>·</span>
                  <span>{selectedProduct.brand}</span>
                  <span>·</span>
                  <span className="capitalize">{selectedProduct.category.replace('_', ' ')}</span>
                </div>

                {/* Title & Language variants */}
                <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">
                  {selectedProduct.name}
                </h2>

                {(selectedProduct.nameJp || selectedProduct.nameKhmer) && (
                  <div className="text-xs text-slate-500 dark:text-neutral-400 mb-2 space-x-2">
                    {selectedProduct.nameJp && <span className="text-slate-700 dark:text-neutral-300">{selectedProduct.nameJp}</span>}
                    {selectedProduct.nameKhmer && (
                      <span className="text-slate-500 font-sans">({selectedProduct.nameKhmer})</span>
                    )}
                  </div>
                )}

                {/* Rating Quick Glance */}
                <div className="flex items-center gap-2 mb-4 text-xs">
                  <div className="flex items-center text-amber-500 dark:text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= Math.round(stats.average)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 dark:text-neutral-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-mono font-bold text-slate-800 dark:text-white tabular-nums">
                    {stats.count > 0 ? stats.average.toFixed(1) : '5.0'}
                  </span>
                  <span className="text-slate-300 dark:text-neutral-500">·</span>
                  <a
                    href="#reviews-section"
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById('reviews-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-slate-500 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-rose-400 transition-colors"
                  >
                    {stats.count} customer {stats.count === 1 ? 'review' : 'reviews'}
                  </a>
                </div>

                {/* Price */}
                <div className="mb-5 p-3 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-850 flex items-baseline justify-between shadow-xs">
                  <div>
                    <div className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
                      ${selectedProduct.price.toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                      Unit: <span className="text-slate-800 dark:text-white font-medium">{selectedProduct.unit}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-xs font-medium ${
                        selectedProduct.inStock ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {selectedProduct.inStock ? '● In Stock & Ready' : '○ Temporarily Out of Stock'}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-neutral-500">Excludes VAT</div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400 mb-1.5">
                    Product Details
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>

                {/* Specifications Pills */}
                <div className="grid grid-cols-2 gap-2.5 mb-6 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
                    <div className="text-slate-500 flex items-center gap-1.5 mb-1">
                      <Box className="w-3.5 h-3.5" />
                      <span>Packaging Spec</span>
                    </div>
                    <div className="font-medium text-slate-900 dark:text-white">{selectedProduct.unit}</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
                    <div className="text-slate-500 flex items-center gap-1.5 mb-1">
                      <Thermometer className="w-3.5 h-3.5" />
                      <span>Temperature</span>
                    </div>
                    <div className="font-medium text-slate-900 dark:text-white">{selectedProduct.storageTemp || 'Standard'}</div>
                  </div>
                </div>

                {/* Purchase Controls / Admin Management */}
                <div className="mt-auto pt-3 border-t border-slate-200 dark:border-neutral-800 space-y-2.5">
                  {currentUser?.role === 'admin' ? (
                    <div className="rounded-xl p-3.5 bg-slate-50 dark:bg-neutral-900/90 border border-slate-200 dark:border-neutral-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
                          <ShieldCheck className="w-4 h-4 text-rose-500" />
                          <span>Administrator Control</span>
                        </div>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          Catalog Operations
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-neutral-400 leading-relaxed">
                        Shopping cart actions are disabled for administrator accounts. You can edit this item's price, specs, stock status, or images from the Admin Dashboard.
                      </p>
                      <button
                        onClick={() => {
                          setSelectedProduct(null);
                          setActiveView('admin');
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-slate-800 dark:text-neutral-200 hover:text-slate-950 dark:hover:text-white border border-slate-300 dark:border-neutral-700/60 text-xs font-medium transition-colors cursor-pointer"
                      >
                        <Box className="w-3.5 h-3.5 text-slate-500 dark:text-neutral-400" />
                        <span>Manage in Admin Dashboard</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        {/* Quantity Stepper */}
                        <div className="flex items-center rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-750 p-1">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            disabled={quantity <= 1 || !selectedProduct.inStock}
                            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center font-mono font-bold text-xs text-slate-800 dark:text-white tabular-nums">
                            {quantity}
                          </span>
                          <button
                            onClick={() => setQuantity(quantity + 1)}
                            disabled={!selectedProduct.inStock}
                            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Add to Cart CTA */}
                        <button
                          onClick={handleAddToCart}
                          disabled={!selectedProduct.inStock}
                          style={selectedProduct.inStock ? { backgroundColor: settings.brandColor || '#e11d48' } : undefined}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white font-medium text-xs sm:text-sm transition-opacity hover:opacity-90 shadow-lg shadow-rose-950/20 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-500 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>Add to Cart (${(selectedProduct.price * quantity).toFixed(2)})</span>
                        </button>
                      </div>

                      {/* Bulk Telegram inquiry option */}
                      <a
                        href={telegramInquiryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#229ED9]/10 hover:bg-[#229ED9]/20 text-[#229ED9] border border-[#229ED9]/30 text-xs font-medium transition-colors cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Inquire Wholesale / Bulk Cut on Telegram</span>
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Section: Customer Review System */}
            <div id="reviews-section" className="p-6 sm:p-8 bg-slate-50/70 dark:bg-neutral-950/60 space-y-8">
              {/* Reviews Summary Header & Rating Distribution */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-neutral-800">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-500 uppercase tracking-wider mb-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Verified Customer Ratings</span>
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Reviews & Feedback ({reviews.length})
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-neutral-400 mt-0.5">
                    Real culinary feedback from Cambodian restaurants, hotels, and gourmet home cooks.
                  </p>
                </div>

                {/* Score & Breakdown Matrix */}
                <div className="flex items-center gap-6 bg-white dark:bg-neutral-900/90 p-4 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-xs shrink-0">
                  <div className="text-center shrink-0 pr-4 border-r border-slate-200 dark:border-neutral-800">
                    <div className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                      {stats.count > 0 ? stats.average.toFixed(1) : '5.0'}
                    </div>
                    <div className="flex items-center justify-center gap-0.5 text-amber-500 dark:text-amber-400 my-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${
                            s <= Math.round(stats.average)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300 dark:text-neutral-700'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-neutral-400">
                      Based on {stats.count} reviews
                    </div>
                  </div>

                  {/* Rating Breakdown Bar Chart */}
                  <div className="space-y-1 w-32 sm:w-44 text-[10px] font-mono">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = stats.breakdown[star] || 0;
                      const pct = stats.count > 0 ? Math.round((count / stats.count) * 100) : 0;
                      return (
                        <div key={star} className="flex items-center gap-2 text-slate-600 dark:text-neutral-400">
                          <span className="w-3 text-right">{star}★</span>
                          <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-neutral-800 overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-5 text-slate-400 dark:text-neutral-500 tabular-nums">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Write a Review Block */}
              <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <span>Leave a Rating & Review</span>
                  </h4>

                  {currentUser && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-neutral-400">
                      <span className="text-slate-400 dark:text-neutral-500">Posting as:</span>
                      <strong className="text-slate-900 dark:text-white">{currentUser.name}</strong>
                      {isVerifiedBuyer && (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800/40 font-mono">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified Buyer</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {currentUser ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    {/* Interactive Star Picker */}
                    <div>
                      <label className="block text-xs text-slate-600 dark:text-neutral-400 mb-1.5">
                        Your Rating: <strong className="text-amber-500 dark:text-amber-400">{RATING_LABELS[hoverRating ?? newRating]}</strong>
                      </label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(null)}
                            className="p-1 hover:scale-115 transition-transform cursor-pointer"
                            aria-label={`Rate ${star} star`}
                          >
                            <Star
                              className={`w-6 h-6 transition-colors ${
                                star <= (hoverRating ?? newRating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300 hover:text-slate-400 dark:text-neutral-600 dark:hover:text-neutral-500'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comment Textarea */}
                    <div>
                      <label className="block text-xs text-slate-600 dark:text-neutral-400 mb-1">
                        Review Comments
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Tell other chefs and customers about flavor, tenderness, packaging condition upon delivery, cooking method, or pairing..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-rose-500 leading-relaxed shadow-xs"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500 dark:text-neutral-500">
                        Reviews are visible to all visitors and verified against purchase history.
                      </span>

                      <button
                        type="submit"
                        style={{ backgroundColor: settings.brandColor || '#e11d48' }}
                        className="px-5 py-2.5 rounded-xl text-white font-semibold text-xs transition-opacity hover:opacity-90 shadow-md shadow-rose-950/20 cursor-pointer"
                      >
                        Submit Product Review
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Unauthenticated Prompt */
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">Have you tasted or used this product?</p>
                      <p className="text-slate-600 dark:text-neutral-400 text-[11px] mt-0.5">
                        Please sign in with your account to leave a star rating and verified culinary review.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      style={{ backgroundColor: settings.brandColor || '#e11d48' }}
                      className="px-4 py-2 rounded-lg text-white font-medium text-xs transition-opacity hover:opacity-90 shrink-0 whitespace-nowrap cursor-pointer"
                    >
                      Sign In to Review
                    </button>
                  </div>
                )}
              </div>

              {/* Reviews List & Sorting Filter */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Customer Testimonials ({sortedReviews.length})
                  </span>

                  <div className="flex items-center gap-2 text-slate-500 dark:text-neutral-400">
                    <span>Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-800 dark:text-neutral-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="highest">Highest Rating</option>
                      <option value="lowest">Lowest Rating</option>
                    </select>
                  </div>
                </div>

                {sortedReviews.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-white dark:bg-neutral-900/40 border border-slate-200 dark:border-neutral-800 text-slate-500 dark:text-neutral-400 text-xs">
                    No reviews written for this product yet. Be the first to review!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedReviews.map((rev) => {
                      const isAuthor = currentUser?.id === rev.userId;
                      const isAdmin = currentUser?.role === 'admin';
                      return (
                        <div
                          key={rev.id}
                          className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-xs space-y-2.5 hover:border-slate-300 dark:hover:border-neutral-750 transition-colors shadow-xs"
                        >
                          {/* Review Top Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-neutral-800 flex items-center justify-center text-[11px] font-semibold text-slate-800 dark:text-white">
                                {rev.userName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-slate-900 dark:text-white">{rev.userName}</span>
                                  {rev.verifiedPurchase && (
                                    <span className="flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                                      <CheckCircle2 className="w-3 h-3" />
                                      <span>Verified Buyer</span>
                                    </span>
                                  )}
                                  {rev.userRole === 'admin' && (
                                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                                      · Store Director
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono">
                                  {new Date(rev.createdAt).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </div>
                              </div>
                            </div>

                            {/* Stars */}
                            <div className="flex items-center gap-0.5 text-amber-500 dark:text-amber-400">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3 h-3 ${
                                    s <= rev.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-300 dark:text-neutral-700'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Comment Body */}
                          <p className="text-slate-700 dark:text-neutral-300 leading-relaxed text-xs">
                            {rev.comment}
                          </p>

                          {/* Footer Actions (Helpful & Delete) */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-neutral-850 text-[11px]">
                            <button
                              onClick={() => markHelpful(rev.id)}
                              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer"
                            >
                              <ThumbsUp className="w-3 h-3" />
                              <span>Helpful ({rev.helpfulCount || 0})</span>
                            </button>

                            {(isAuthor || isAdmin) && (
                              <button
                                onClick={() => {
                                  if (confirm('Delete this review?')) {
                                    deleteReview(rev.id);
                                  }
                                }}
                                className="flex items-center gap-1 text-slate-400 hover:text-red-500 dark:text-neutral-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
