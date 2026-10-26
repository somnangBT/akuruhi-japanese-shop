import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ArrowLeft,
  QrCode,
  Send,
  Copy,
  Check,
  Upload,
  CheckCircle2,
  FileCheck,
  ExternalLink,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PaymentMethod, Order } from '../types';
import { optimizeImageForWeb } from '../utils/imageOptimizer';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutModalOpen,
    setIsCheckoutModalOpen,
    setIsCartOpen,
    cart,
    cartSubtotal,
    cartDeliveryFee,
    cartTotal,
    currentUser,
    createOrder,
    settings,
    setActiveView,
    showToast,
  } = useStore();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qr_code');
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [telegramHandle, setTelegramHandle] = useState(currentUser?.telegram || '');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentSlipUrl, setPaymentSlipUrl] = useState<string | null>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  if (!isCheckoutModalOpen || currentUser?.role === 'admin') return null;

  const handleBackToCart = () => {
    setIsCheckoutModalOpen(false);
    setIsCartOpen(true);
  };

  const handleCancel = () => {
    setIsCheckoutModalOpen(false);
    setPlacedOrder(null);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(settings.accountNumber);
    setCopiedAccount(true);
    showToast('Bank account number copied to clipboard.');
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const optimized = await optimizeImageForWeb(file, { maxWidth: 1000, maxHeight: 1000, quality: 0.8 });
        setPaymentSlipUrl(optimized.dataUrl);
        showToast(`Payment slip uploaded successfully (${optimized.sizeKb} KB).`);
      } catch (err) {
        console.warn('Payment slip read error:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPaymentSlipUrl(reader.result as string);
          showToast('Payment slip uploaded successfully.');
        };
        reader.readAsDataURL(file);
      } finally {
        e.target.value = '';
      }
    }
  };

  // Generate simulated instant receipt for test convenience
  const handleSimulateSlip = () => {
    const slipSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600" fill="%23ffffff"><rect width="400" height="600" fill="%230f172a"/><rect x="20" y="20" width="360" height="560" rx="16" fill="%231e293b" stroke="%23334155" stroke-width="2"/><circle cx="200" cy="90" r="32" fill="%2310b981"/><path d="M188 90l8 8 16-16" stroke="%23ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/><text x="200" y="150" fill="%23ffffff" font-family="sans-serif" font-size="18" font-weight="bold" text-anchor="middle">ABA KHQR Transfer Successful</text><text x="200" y="180" fill="%2338bdf8" font-family="monospace" font-size="28" font-weight="bold" text-anchor="middle">$${cartTotal.toFixed(2)} USD</text><line x1="50" y1="210" x2="350" y2="210" stroke="%23334155" stroke-width="1" stroke-dasharray="4"/><text x="50" y="250" fill="%2394a3b8" font-family="sans-serif" font-size="13">To Merchant:</text><text x="350" y="250" fill="%23ffffff" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="end">AKURUHI CAMBODIA</text><text x="50" y="290" fill="%2394a3b8" font-family="sans-serif" font-size="13">Account:</text><text x="350" y="290" fill="%23ffffff" font-family="monospace" font-size="13" text-anchor="end">001 889 231</text><text x="50" y="330" fill="%2394a3b8" font-family="sans-serif" font-size="13">Ref ID:</text><text x="350" y="330" fill="%23ffffff" font-family="monospace" font-size="13" text-anchor="end">ABA-${Math.floor(10000000 + Math.random() * 90000000)}</text><text x="50" y="370" fill="%2394a3b8" font-family="sans-serif" font-size="13">Date:</text><text x="350" y="370" fill="%23ffffff" font-family="sans-serif" font-size="13" text-anchor="end">2026-10-23 21:50</text><rect x="60" y="420" width="280" height="90" rx="8" fill="%230f172a"/><text x="200" y="460" fill="%2310b981" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">VERIFIED BANK RECEIPT</text><text x="200" y="485" fill="%2364748b" font-family="sans-serif" font-size="11" text-anchor="middle">Official KHQR Transaction Slip</text></svg>`;
    setPaymentSlipUrl(slipSvg);
    setTransactionRef(`ABA-${Math.floor(10000000 + Math.random() * 90000000)}`);
    showToast('Generated sample ABA transfer slip for testing.');
  };

  // Build Telegram Order text
  const telegramOrderMessage = `🍣 AKURUHI CAMBODIA - NEW ORDER
Customer: ${name || 'Valued Customer'}
Phone: ${phone || 'Not provided'}
Telegram: ${telegramHandle ? `@${telegramHandle.replace('@', '')}` : 'N/A'}
Delivery Address: ${address || 'Phnom Penh'}
Notes: ${deliveryNotes || 'None'}

ITEMS:
${cart.map((i) => `• ${i.quantity}x ${i.product.name} (${i.product.code}) - $${(i.product.price * i.quantity).toFixed(2)}`).join('\n')}

Subtotal: $${cartSubtotal.toFixed(2)}
Delivery: ${cartDeliveryFee === 0 ? 'FREE' : `$${cartDeliveryFee.toFixed(2)}`}
TOTAL AMOUNT: $${cartTotal.toFixed(2)} USD`;

  const telegramUrl = `${settings.telegramDirectUrl}?text=${encodeURIComponent(telegramOrderMessage)}`;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      showToast('Please fill in your recipient name, phone number, and delivery address.');
      return;
    }

    const order = createOrder({
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      deliveryAddress: address,
      telegramHandle: telegramHandle ? `@${telegramHandle.replace('@', '')}` : undefined,
      deliveryNotes: deliveryNotes || undefined,
      paymentMethod,
      paymentSlipUrl: paymentSlipUrl || undefined,
      transactionRef: transactionRef || undefined,
    });

    setPlacedOrder(order);

    if (paymentMethod === 'telegram') {
      window.open(telegramUrl, '_blank');
    } else if (paymentMethod === 'qr_code') {
      const qrNotificationMessage = `🔔 PAID ORDER CONFIRMATION - ABA KHQR
Order Number: #${order.orderNumber}
Customer: ${name}
Phone: ${phone}
Telegram: ${telegramHandle ? `@${telegramHandle.replace('@', '')}` : 'N/A'}
Address: ${address}
Payment Method: ABA KHQR / Bank Transfer ($${order.total.toFixed(2)} USD)
Ref / Slip: ${transactionRef || (paymentSlipUrl ? 'Bank Receipt Attached' : 'Instant KHQR Completed')}
Notes: ${deliveryNotes || 'None'}

PURCHASED ITEMS:
${cart.map((i) => `• ${i.quantity}x ${i.product.name} (${i.product.code}) - $${(i.product.price * i.quantity).toFixed(2)}`).join('\n')}

Subtotal: $${cartSubtotal.toFixed(2)}
Delivery: ${cartDeliveryFee === 0 ? 'FREE' : `$${cartDeliveryFee.toFixed(2)}`}
TOTAL PAID: $${order.total.toFixed(2)} USD

Status: Customer confirmed QR transfer & receipt. Please verify and dispatch order.`;

      const qrTelegramUrl = `${settings.telegramDirectUrl}?text=${encodeURIComponent(qrNotificationMessage)}`;
      window.open(qrTelegramUrl, '_blank');
      showToast('Order confirmed! Telegram payment notification dispatched to store.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative w-full max-w-2xl bg-white dark:bg-[#11141c] rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-8 text-slate-900 dark:text-neutral-100"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {!placedOrder && (
                <button
                  type="button"
                  onClick={handleBackToCart}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-slate-700 hover:text-slate-900 dark:text-neutral-300 dark:hover:text-white border border-slate-200 dark:border-neutral-750 text-xs font-medium transition-colors shrink-0 cursor-pointer"
                  title="Return to shopping cart"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Cart</span>
                </button>
              )}
              <div className="min-w-0">
                <div
                  style={{ color: settings.brandColor || '#e11d48' }}
                  className="text-xs font-semibold uppercase tracking-wider truncate"
                >
                  Direct Japanese Food Supply
                </div>
                <h2 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white truncate">
                  {placedOrder ? 'Order Confirmed!' : 'Checkout & Payment'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!placedOrder && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleCancel}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Close checkout"
                aria-label="Close checkout"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Placed Order Success Screen */}
          {placedOrder ? (
            <div className="p-6 md:p-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  Thank You for Your Order!
                </h3>
                <p className="text-sm text-slate-600 dark:text-neutral-400">
                  Order Number:{' '}
                  <span className="font-mono text-slate-900 dark:text-white font-bold">{placedOrder.orderNumber}</span>
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-left text-xs space-y-2 shadow-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-neutral-400">Recipient:</span>
                  <span className="text-slate-900 dark:text-white font-medium">{placedOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-neutral-400">Delivery Address:</span>
                  <span className="text-slate-900 dark:text-white font-medium truncate max-w-[220px]">
                    {placedOrder.deliveryAddress}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-neutral-400">Payment Method:</span>
                  <span className="text-slate-900 dark:text-white font-medium capitalize">
                    {placedOrder.paymentMethod === 'qr_code' ? 'ABA KHQR Code' : 'Telegram Confirmation'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-neutral-400">Total Paid:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
                    ${placedOrder.total.toFixed(2)} USD
                  </span>
                </div>
              </div>

              {/* Telegram Confirmation Notice for QR code purchases */}
              {placedOrder.paymentMethod === 'qr_code' && (
                <div className="p-4 rounded-xl bg-sky-50 dark:bg-[#229ED9]/10 border border-sky-200 dark:border-[#229ED9]/30 text-xs text-sky-800 dark:text-[#229ED9] text-left flex items-start gap-3">
                  <Send className="w-5 h-5 shrink-0 mt-0.5 text-sky-600 dark:text-[#229ED9]" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900 dark:text-white">Telegram Payment Notification Dispatched</p>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-0.5 rounded font-mono font-medium">
                        DISPATCHED
                      </span>
                    </div>
                    <p className="mt-1 text-slate-700 dark:text-neutral-300 leading-relaxed">
                      A notification confirming your purchase and completed QR payment of <strong className="text-slate-900 dark:text-white">${placedOrder.total.toFixed(2)} USD</strong> has been sent to our sales dispatch at <strong className="text-sky-600 dark:text-sky-300">@{settings.telegramUsername}</strong>.
                    </p>
                    <a
                      href={`${settings.telegramDirectUrl}?text=${encodeURIComponent(`🔔 PAID ORDER CONFIRMATION - ABA KHQR\nOrder Number: #${placedOrder.orderNumber}\nCustomer: ${placedOrder.customerName}\nPhone: ${placedOrder.customerPhone}\nTotal Paid: $${placedOrder.total.toFixed(2)} USD\nPayment: ABA KHQR Completed`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2.5 inline-flex items-center gap-1.5 font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 hover:underline"
                    >
                      <span>View / Resend Notification to Store Telegram</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {placedOrder.paymentMethod === 'telegram' && (
                <div className="p-4 rounded-xl bg-sky-50 dark:bg-[#229ED9]/10 border border-sky-200 dark:border-[#229ED9]/20 text-xs text-sky-800 dark:text-[#229ED9] text-left flex items-start gap-3">
                  <Send className="w-5 h-5 shrink-0 mt-0.5 text-sky-600 dark:text-[#229ED9]" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Telegram Confirmation Sent</p>
                    <p className="mt-0.5 text-slate-700 dark:text-neutral-300">
                      Our dispatch manager will review your order details on Telegram and reply with the delivery ETA immediately.
                    </p>
                    <a
                      href={telegramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:underline"
                    >
                      <span>Re-open Telegram Chat</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsCheckoutModalOpen(false);
                    setPlacedOrder(null);
                    setActiveView('my-orders');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-slate-800 dark:text-white text-xs font-semibold border border-slate-200 dark:border-neutral-700 transition-colors cursor-pointer"
                >
                  View in My Orders
                </button>
                <button
                  onClick={() => {
                    setIsCheckoutModalOpen(false);
                    setPlacedOrder(null);
                    setActiveView('store');
                  }}
                  style={{ backgroundColor: settings.brandColor || '#e11d48' }}
                  className="px-5 py-2.5 rounded-xl text-white text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Back to Store
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitOrder} className="p-6 space-y-6">
              {/* Order Summary Recap */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-850 flex items-center justify-between text-xs shadow-xs">
                <div>
                  <span className="text-slate-500 dark:text-neutral-400">Order Items: </span>
                  <span className="font-medium text-slate-900 dark:text-white">{cart.length} items</span>
                  <span className="text-slate-300 dark:text-neutral-600 mx-2">·</span>
                  <span className="text-slate-500 dark:text-neutral-400">Delivery: </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    {cartDeliveryFee === 0 ? 'FREE' : `$${cartDeliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-mono text-base font-bold text-slate-900 dark:text-white tabular-nums">
                    ${cartTotal.toFixed(2)} USD
                  </div>
                </div>
              </div>

              {/* Customer Information Inputs */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                  1. Delivery Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 dark:text-neutral-400 mb-1">
                      Recipient Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sophia Sokha"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-rose-500 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-600 dark:text-neutral-400 mb-1">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +855 12 345 678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-rose-500 shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 dark:text-neutral-400 mb-1">
                      Telegram Username (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-400 dark:text-neutral-500 text-xs">@</span>
                      <input
                        type="text"
                        placeholder="username"
                        value={telegramHandle.replace('@', '')}
                        onChange={(e) => setTelegramHandle(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-rose-500 shadow-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-600 dark:text-neutral-400 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-rose-500 shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-600 dark:text-neutral-400 mb-1">
                    Phnom Penh Street Address & Landmark <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. No. 42, St 310, Boeung Keng Kang 1, Phnom Penh"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-rose-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-600 dark:text-neutral-400 mb-1">
                    Delivery Instructions / Handling Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Keep Wagyu beef insulated, deliver to 2nd floor reception"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-rose-500 shadow-xs"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                  2. Choose Payment Method
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {/* Option 1: QR Code */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qr_code')}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      paymentMethod === 'qr_code'
                        ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-500 shadow-sm shadow-rose-950/20'
                        : 'bg-slate-50 dark:bg-neutral-900 border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <QrCode
                        className={`w-5 h-5 ${
                          paymentMethod === 'qr_code' ? 'text-rose-600 dark:text-rose-500' : 'text-slate-400 dark:text-neutral-400'
                        }`}
                      />
                      <span className="font-mono text-[10px] text-rose-600 dark:text-rose-400 font-semibold uppercase">
                        Instant KHQR
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white text-xs">Pay via QR Code</div>
                      <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                        ABA Bank / Bakong KHQR
                      </div>
                    </div>
                  </button>

                  {/* Option 2: Telegram */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('telegram')}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      paymentMethod === 'telegram'
                        ? 'bg-sky-50 dark:bg-[#229ED9]/15 border-sky-400 dark:border-[#229ED9] shadow-sm shadow-sky-950/20'
                        : 'bg-slate-50 dark:bg-neutral-900 border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Send
                        className={`w-5 h-5 ${
                          paymentMethod === 'telegram' ? 'text-sky-600 dark:text-[#229ED9]' : 'text-slate-400 dark:text-neutral-400'
                        }`}
                      />
                      <span className="font-mono text-[10px] text-sky-600 dark:text-[#229ED9] font-semibold uppercase">
                        Chat Order
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white text-xs">Order via Telegram</div>
                      <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                        Direct sales dispatch @{settings.telegramUsername}
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Dynamic Payment Method Content */}
              {paymentMethod === 'qr_code' ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    {/* KHQR Card & Graphic */}
                    <div className="p-3 bg-white rounded-xl shadow-md shrink-0 flex flex-col items-center border border-slate-200">
                      <div className="text-[9px] font-bold text-red-600 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                        <span>KHQR · BAKONG</span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-semibold ${
                          settings.qrImageUrl
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                        }`}>
                          {settings.qrImageUrl ? 'OFFICIAL QR' : 'DYNAMIC KHQR'}
                        </span>
                      </div>

                      {settings.qrImageUrl ? (
                        <div className="w-36 h-36 flex items-center justify-center p-1 bg-white rounded overflow-hidden border border-neutral-200">
                          <img
                            src={settings.qrImageUrl}
                            alt="Official Merchant Payment QR Code"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-36 h-36 flex items-center justify-center p-1 bg-white rounded overflow-hidden border border-neutral-200 relative">
                          {/* Real scannable dynamic QR code with order amount */}
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=8&data=${encodeURIComponent(
                              settings.khqrMerchantId
                                ? `bakong://qr?id=${settings.khqrMerchantId}&amount=${cartTotal.toFixed(2)}&currency=USD`
                                : `${settings.bankName}: ${settings.accountNumber} (${settings.accountName}) - $${cartTotal.toFixed(2)} USD`
                            )}`}
                            alt="Dynamic Order Payment QR Code"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                              const fallback = (e.target as HTMLElement).nextElementSibling;
                              if (fallback) (fallback as HTMLElement).style.display = 'block';
                            }}
                          />
                          {/* Stylized vector fallback if offline */}
                          <svg
                            className="w-full h-full hidden"
                            viewBox="0 0 100 100"
                            shapeRendering="crispEdges"
                          >
                            <rect width="100" height="100" fill="#ffffff" />
                            <rect x="5" y="5" width="25" height="25" fill="#000000" />
                            <rect x="8" y="8" width="19" height="19" fill="#ffffff" />
                            <rect x="11" y="11" width="13" height="13" fill="#000000" />

                            <rect x="70" y="5" width="25" height="25" fill="#000000" />
                            <rect x="73" y="8" width="19" height="19" fill="#ffffff" />
                            <rect x="76" y="11" width="13" height="13" fill="#000000" />

                            <rect x="5" y="70" width="25" height="25" fill="#000000" />
                            <rect x="8" y="73" width="19" height="19" fill="#ffffff" />
                            <rect x="11" y="76" width="13" height="13" fill="#000000" />

                            <rect x="36" y="8" width="6" height="6" fill="#000000" />
                            <rect x="46" y="8" width="6" height="6" fill="#000000" />
                            <rect x="56" y="8" width="6" height="6" fill="#000000" />
                            <rect x="36" y="20" width="6" height="6" fill="#000000" />
                            <rect x="50" y="20" width="12" height="6" fill="#000000" />
                            <rect x="8" y="36" width="6" height="6" fill="#000000" />
                            <rect x="20" y="36" width="6" height="6" fill="#000000" />
                            <rect
                              x="36"
                              y="36"
                              width="28"
                              height="28"
                              fill={settings.brandColor || '#e11d48'}
                              rx="4"
                            />
                            <text
                              x="50"
                              y="55"
                              fill="#ffffff"
                              fontSize="13"
                              fontWeight="bold"
                              textAnchor="middle"
                              fontFamily="sans-serif"
                            >
                              {settings.logoText || '旭'}
                            </text>

                            <rect x="70" y="36" width="12" height="6" fill="#000000" />
                            <rect x="86" y="36" width="6" height="6" fill="#000000" />
                            <rect x="8" y="48" width="6" height="6" fill="#000000" />
                            <rect x="20" y="48" width="6" height="6" fill="#000000" />
                            <rect x="70" y="48" width="6" height="6" fill="#000000" />
                            <rect x="86" y="48" width="6" height="6" fill="#000000" />

                            <rect x="36" y="70" width="6" height="6" fill="#000000" />
                            <rect x="48" y="70" width="16" height="6" fill="#000000" />
                            <rect x="70" y="70" width="6" height="6" fill="#000000" />
                            <rect x="82" y="70" width="10" height="6" fill="#000000" />
                            <rect x="36" y="82" width="12" height="6" fill="#000000" />
                            <rect x="54" y="82" width="6" height="6" fill="#000000" />
                            <rect x="70" y="82" width="22" height="6" fill="#000000" />
                          </svg>
                        </div>
                      )}

                      <div className="font-mono text-xs font-bold text-neutral-900 mt-1">
                        ${cartTotal.toFixed(2)} USD
                      </div>
                    </div>

                    {/* Bank Details & Copy */}
                    <div className="flex-1 space-y-2 text-xs">
                      <div>
                        <div className="text-slate-500 dark:text-neutral-400 text-[11px]">Merchant Name</div>
                        <div className="font-semibold text-slate-900 dark:text-white">{settings.accountName}</div>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800">
                        <div>
                          <div className="text-[10px] text-slate-500 dark:text-neutral-400">{settings.bankName}</div>
                          <div
                            style={{ color: settings.brandColor || '#e11d48' }}
                            className="font-mono font-bold text-sm"
                          >
                            {settings.accountNumber}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyAccount}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 transition-colors cursor-pointer"
                        >
                          {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedAccount ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-neutral-400">
                        {settings.qrImageUrl
                          ? 'Scan the official merchant QR code using ABA Mobile, Bakong, or any Cambodian banking app.'
                          : 'Scan with your ABA Mobile, Bakong, Acleda, or any Cambodian banking app. Then attach the payment screenshot below.'}
                      </p>
                    </div>
                  </div>

                  {/* Payment Receipt Upload & Ref */}
                  <div className="pt-3 border-t border-slate-200 dark:border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-700 dark:text-neutral-300">
                        Attach Payment Receipt / Slip
                      </label>
                      <button
                        type="button"
                        onClick={handleSimulateSlip}
                        className="text-[11px] text-sky-600 hover:text-sky-700 dark:text-sky-400 hover:underline cursor-pointer"
                      >
                        Auto-generate Test Receipt
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-slate-300 dark:border-neutral-700 hover:border-slate-400 dark:hover:border-neutral-500 bg-white dark:bg-neutral-950/60 cursor-pointer transition-colors text-xs text-slate-700 dark:text-neutral-300">
                        <Upload className="w-4 h-4 text-slate-400 dark:text-neutral-400" />
                        <span>{paymentSlipUrl ? 'Change Receipt Slip' : 'Upload Bank Transfer Slip'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>

                      <div className="w-1/2">
                        <input
                          type="text"
                          placeholder="Or enter Ref ID (e.g. ABA-123456)"
                          value={transactionRef}
                          onChange={(e) => setTransactionRef(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg bg-white dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-rose-500 shadow-xs"
                        />
                      </div>
                    </div>

                    {paymentSlipUrl && (
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 text-xs">
                        <FileCheck className="w-4 h-4 shrink-0" />
                        <span className="truncate flex-1">Receipt attached and ready for admin verification.</span>
                        <img
                          src={paymentSlipUrl}
                          alt="Slip preview"
                          className="w-8 h-8 rounded object-cover border border-emerald-300 dark:border-emerald-700/60"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Telegram Content */
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-sky-100 dark:bg-[#229ED9]/20 text-sky-600 dark:text-[#229ED9] shrink-0 mt-0.5">
                      <Send className="w-5 h-5" />
                    </div>
                    <div className="text-xs">
                      <h4 className="font-semibold text-slate-900 dark:text-white">Direct Telegram Checkout & Live Support</h4>
                      <p className="text-slate-600 dark:text-neutral-400 mt-0.5 leading-relaxed">
                        In Cambodia, Telegram is the fastest way to arrange direct delivery, confirm cold-storage handling, or pay via cash/delivery. Clicking "Place Order" will register your order and open Telegram with your complete cart pre-formatted.
                      </p>
                    </div>
                  </div>

                  {/* Pre-formatted message preview */}
                  <div className="p-3 rounded-lg bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-850 font-mono text-[11px] text-slate-700 dark:text-neutral-300 whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">
                    {telegramOrderMessage}
                  </div>
                </div>
              )}

              {/* Actions: Back, Cancel, and Complete Order */}
              <div className="pt-3 border-t border-slate-200 dark:border-neutral-800 flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleBackToCart}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-slate-700 hover:text-slate-900 dark:text-neutral-300 dark:hover:text-white border border-slate-200 dark:border-neutral-750 font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
                  title="Return to cart"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-500 dark:text-neutral-400" />
                  <span>Back to Cart</span>
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-3 rounded-xl bg-transparent hover:bg-slate-100 dark:hover:bg-neutral-850 text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white border border-slate-200 dark:border-neutral-800 font-medium text-xs sm:text-sm transition-all text-center cursor-pointer"
                >
                  <span>Cancel</span>
                </button>

                <button
                  type="submit"
                  style={{ backgroundColor: settings.brandColor || '#e11d48' }}
                  className="flex-1 py-3.5 px-4 rounded-xl text-white font-semibold text-xs sm:text-sm transition-all hover:opacity-90 shadow-lg shadow-rose-950/20 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  {paymentMethod === 'qr_code' ? (
                    <>
                      <QrCode className="w-4 h-4" />
                      <span>Confirm & Complete Order (${cartTotal.toFixed(2)})</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Order to Telegram (@{settings.telegramUsername})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
