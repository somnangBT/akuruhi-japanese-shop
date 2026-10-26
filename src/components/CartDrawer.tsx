import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartDeliveryFee,
    cartTotal,
    setIsCheckoutModalOpen,
    settings,
    currentUser,
  } = useStore();

  if (!isCartOpen || currentUser?.role === 'admin') return null;

  const freeDeliveryProgress = Math.min(
    100,
    Math.round((cartSubtotal / settings.freeDeliveryThreshold) * 100)
  );

  const amountNeededForFree = (settings.freeDeliveryThreshold - cartSubtotal).toFixed(2);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCartOpen(false)}
          className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm"
        />

        {/* Drawer Container */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="relative w-full max-w-md bg-white dark:bg-[#0f1218] border-l border-slate-200 dark:border-neutral-800 h-full shadow-2xl flex flex-col z-10 text-slate-900 dark:text-neutral-100"
        >
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-600/10 dark:bg-rose-600/20 text-rose-600 dark:text-rose-500 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display font-bold text-slate-900 dark:text-white text-base">Your Cart</h2>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  {cart.length} {cart.length === 1 ? 'item' : 'items'} selected
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-slate-400 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-400 transition-colors p-1.5 cursor-pointer"
                  title="Clear all items"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Delivery Threshold Indicator */}
          {cart.length > 0 && (
            <div className="px-5 py-3 bg-slate-50 dark:bg-neutral-900/80 border-b border-slate-200 dark:border-neutral-800 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-neutral-300">
                  <Truck className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  {cartSubtotal >= settings.freeDeliveryThreshold ? (
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                      Unlocked Free Express Delivery in Phnom Penh!
                    </span>
                  ) : (
                    <span>
                      Add <strong className="text-slate-900 dark:text-white">${amountNeededForFree}</strong> more for free delivery
                    </span>
                  )}
                </span>
                <span className="font-mono text-slate-500 dark:text-neutral-400">{freeDeliveryProgress}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${freeDeliveryProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 divide-y divide-slate-100 dark:divide-neutral-850">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-neutral-400">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 flex items-center justify-center text-slate-400 dark:text-neutral-500 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="text-base font-semibold text-slate-900 dark:text-white mb-1">Your cart is empty</p>
                <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-xs mb-6">
                  Browse our authentic Japanese meats, seafood, sauces, and sake to start your order.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="pt-3 first:pt-0 flex gap-3.5">
                  {/* Thumbnail */}
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-18 h-18 rounded-lg object-cover bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shrink-0"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {item.product.name}
                        </h3>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-slate-400 hover:text-red-500 dark:text-neutral-500 dark:hover:text-red-400 transition-colors shrink-0 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono mt-0.5">
                        {item.product.code} · {item.product.unit}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Stepper */}
                      <div className="flex items-center rounded-lg bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-0.5">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center font-mono text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Total for item */}
                      <div className="font-mono text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Footer */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 pb-8 sm:pb-5 bg-slate-50 dark:bg-neutral-950 border-t border-slate-200 dark:border-neutral-800 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500 dark:text-neutral-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-slate-900 dark:text-white tabular-nums">${cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-neutral-400">
                  <span>Delivery Fee (Phnom Penh)</span>
                  <span className="font-mono text-slate-900 dark:text-white tabular-nums">
                    {cartDeliveryFee === 0 ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-medium">FREE</span>
                    ) : (
                      `$${cartDeliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-neutral-850 flex justify-between items-baseline">
                  <span className="font-medium text-slate-900 dark:text-white">Estimated Total</span>
                  <span className="font-mono text-lg font-extrabold text-slate-900 dark:text-white tabular-nums">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 pt-1">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutModalOpen(true);
                  }}
                  style={{ backgroundColor: settings.brandColor || '#e11d48' }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-medium text-sm transition-opacity hover:opacity-90 shadow-lg shadow-rose-950/20 active:scale-[0.98] cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
