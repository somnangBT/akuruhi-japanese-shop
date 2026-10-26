import React from 'react';
import { ShoppingBag, Clock, PackageCheck, Send, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { OrderStatus } from '../types';

export const CustomerOrdersView: React.FC = () => {
  const { orders, currentUser, setActiveView, addToCart, setIsCartOpen, settings } = useStore();

  const customerOrders = orders.filter((o) => {
    if (!currentUser) return false;
    const matchId = o.customerId === currentUser.id;
    const matchEmail = currentUser.email && o.customerEmail?.toLowerCase() === currentUser.email.toLowerCase();
    const matchPhone = currentUser.phone && o.customerPhone && o.customerPhone.replace(/[^0-9]/g, '') === currentUser.phone.replace(/[^0-9]/g, '');
    return matchId || matchEmail || matchPhone;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending_payment':
        return (
          <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800/60 text-xs font-medium">
            Pending Payment
          </span>
        );
      case 'verification_pending':
        return (
          <span className="px-2.5 py-1 rounded bg-sky-100 text-sky-800 border border-sky-300 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-800/60 text-xs font-medium">
            Slip Verifying
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800/60 text-xs font-medium">
            Order Confirmed
          </span>
        );
      case 'processing':
        return (
          <span className="px-2.5 py-1 rounded bg-indigo-100 text-indigo-800 border border-indigo-300 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-800/60 text-xs font-medium">
            Cold-Chain Packing
          </span>
        );
      case 'out_for_delivery':
        return (
          <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/60 text-xs font-semibold">
            Out for Delivery
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-300 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700 text-xs font-medium">
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800/60 text-xs font-medium">
            Cancelled
          </span>
        );
    }
  };

  const handleReorder = (items: typeof customerOrders[0]['items']) => {
    items.forEach((item) => {
      addToCart(item.product, item.quantity);
    });
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-slate-900 dark:text-neutral-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-neutral-800 mb-8">
        <div>
          <button
            onClick={() => setActiveView('store')}
            className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Storefront</span>
          </button>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            My Orders & Purchase History
          </h1>
          <p className="text-xs text-slate-600 dark:text-neutral-400 mt-1">
            Tracking account for <strong className="text-slate-900 dark:text-white">{currentUser?.name}</strong> ({currentUser?.email})
          </p>
        </div>

        <button
          onClick={() => setActiveView('store')}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          + Create New Order
        </button>
      </div>

      {customerOrders.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-800 max-w-md mx-auto shadow-sm">
          <ShoppingBag className="w-12 h-12 text-slate-400 dark:text-neutral-600 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-900 dark:text-white text-base mb-1">No orders placed yet</h3>
          <p className="text-xs text-slate-600 dark:text-neutral-400 mb-6">
            When you purchase items with ABA KHQR or Telegram, your receipts and shipment tracking will appear here.
          </p>
          <button
            onClick={() => setActiveView('store')}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors shadow-sm"
          >
            Browse Japanese Catalog
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {customerOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-[#11141c] rounded-2xl border border-slate-200 dark:border-neutral-800/80 p-5 sm:p-6 space-y-4 hover:border-slate-300 dark:hover:border-neutral-700/80 transition-all shadow-md dark:shadow-lg"
            >
              {/* Order Card Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="font-mono text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    {order.orderNumber}
                  </div>
                  <span className="text-slate-400 dark:text-neutral-600">·</span>
                  <div className="text-xs text-slate-500 dark:text-neutral-400 font-mono">
                    {new Date(order.createdAt).toLocaleDateString()} at{' '}
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(order.orderStatus)}
                </div>
              </div>

              {/* Order Body Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Items List */}
                <div className="md:col-span-2 space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400 mb-2">
                    Items ({order.items.length})
                  </div>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-900/80 border border-slate-200 dark:border-neutral-850 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-200 dark:bg-neutral-800 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-medium text-slate-900 dark:text-white truncate">
                              {item.product.name}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono">
                              {item.product.code} · {item.product.unit}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 ml-3">
                          <div className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-neutral-500 font-mono">
                            Qty: {item.quantity}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery & Payment Summary */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-850 flex flex-col justify-between text-xs space-y-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400 mb-2">
                      Destination & Pay
                    </div>
                    <div className="text-slate-900 dark:text-white font-medium">{order.customerName}</div>
                    <div className="text-slate-500 dark:text-neutral-400 font-mono text-[11px]">{order.customerPhone}</div>
                    <div className="text-slate-600 dark:text-neutral-400 text-[11px] mt-1 leading-relaxed">
                      {order.deliveryAddress}
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-neutral-800 space-y-1">
                      <div className="flex justify-between text-slate-600 dark:text-neutral-400">
                        <span>Payment Method:</span>
                        <span className="text-slate-900 dark:text-white capitalize">
                          {order.paymentMethod === 'qr_code' ? 'ABA KHQR' : 'Telegram'}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-neutral-400">
                        <span>Subtotal:</span>
                        <span className="font-mono text-slate-900 dark:text-white tabular-nums">${order.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-neutral-400">
                        <span>Delivery:</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                          {order.deliveryFee === 0 ? 'FREE' : `$${order.deliveryFee.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-900 dark:text-white font-semibold pt-1 border-t border-slate-200 dark:border-neutral-800">
                        <span>Total:</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 text-sm tabular-nums">
                          ${order.total.toFixed(2)} USD
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2">
                    <a
                      href={`${settings.telegramDirectUrl}?text=${encodeURIComponent(
                        `Hello! Regarding my Akuruhi Order ${order.orderNumber} ($${order.total.toFixed(2)}), I have a question:`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#229ED9]/15 hover:bg-[#229ED9]/25 text-[#229ED9] border border-[#229ED9]/30 font-medium transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Chat on Telegram</span>
                    </a>

                    <button
                      onClick={() => handleReorder(order.items)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-200 dark:bg-neutral-800 hover:bg-slate-300 dark:hover:bg-neutral-750 text-slate-800 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Re-order Items</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
