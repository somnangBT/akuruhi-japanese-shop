import React from 'react';
import { motion } from 'motion/react';
import { FileText, Send, ShoppingCart, Truck, Award, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { HERO_BANNER_IMAGE } from '../data/initialProducts';

export const Hero: React.FC = () => {
  const { setIsQuotationModalOpen, settings } = useStore();

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden border-b border-slate-200 dark:border-neutral-800 transition-colors duration-200">
      {/* Background Photography with Contrast Scrim */}
      {settings.backgroundScope !== 'entire_store' && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src={settings.backgroundImageUrl || HERO_BANNER_IMAGE}
            alt="Japanese Culinary and Beverage Supply spread"
            referrerPolicy="no-referrer"
            style={{
              filter: `brightness(${1 - (settings.backgroundDarkness ?? 0.75) * 0.7}) blur(${settings.backgroundBlur || 0}px)`,
            }}
            className="w-full h-full object-cover object-center saturate-[0.85] opacity-25 dark:opacity-100 transition-opacity"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/80 to-slate-50/40 dark:from-[#0b0d10] dark:via-[#0b0d10]/70 dark:to-[#0b0d10]/30 transition-colors"
            style={{
              backgroundColor: `rgba(11, 13, 16, ${(settings.backgroundDarkness ?? 0.75) * 0.5})`,
            }}
          />
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="max-w-3xl">
          {/* Subtle Trust Label */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-4"
          >
            <span>{settings.heroBadgeText || 'Akuruhi Cambodia · Since 1998 · Phnom Penh Wholesale & Retail'}</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-6"
            style={{ textWrap: 'balance' }}
          >
            {settings.heroTitle || 'Authentic Japanese Food & Beverage Supply for Cambodia.'}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-700 dark:text-neutral-300 leading-relaxed mb-8 max-w-2xl"
          >
            {settings.heroSubtitle ||
              'From A5 Japanese Wagyu and Toyosu bluefin tuna to brewed soy sauces, golden curries, and Dassai Junmai Daiginjo sake. Direct import with cold-chain guarantee.'}
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-3"
          >
            <button
              onClick={scrollToCatalog}
              style={{ backgroundColor: settings.brandColor || '#e11d48' }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium text-sm transition-opacity hover:opacity-90 shadow-lg shadow-rose-950/20 active:scale-[0.98] whitespace-nowrap cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Explore Products</span>
            </button>

            <a
              href={settings.telegramDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#229ED9] hover:bg-[#1e8ec3] text-white font-medium text-sm transition-all shadow-lg shadow-sky-950/20 active:scale-[0.98] whitespace-nowrap cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Order via Telegram</span>
            </a>

            <button
              onClick={() => setIsQuotationModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/95 dark:bg-neutral-900/90 hover:bg-white dark:hover:bg-neutral-800 text-slate-800 dark:text-neutral-200 border border-slate-300 dark:border-neutral-700 font-medium text-sm transition-colors shadow-xs whitespace-nowrap cursor-pointer"
            >
              <FileText className="w-4 h-4 text-slate-500 dark:text-neutral-400" />
              <span>Quotation PDF</span>
            </button>
          </motion.div>
        </div>

        {/* 3-Column Trust Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16 pt-8 border-t border-slate-200 dark:border-neutral-800/80 grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-900/80 border border-slate-200 dark:border-neutral-800 text-rose-600 dark:text-rose-400 shrink-0 shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Cold-Chain Assured</h2>
              <p className="text-xs text-slate-600 dark:text-neutral-400 mt-0.5">
                Sub-zero -20°C delivery in Phnom Penh. Preserves sashimi grade and Wagyu freshness.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-900/80 border border-slate-200 dark:border-neutral-800 text-sky-600 dark:text-sky-400 shrink-0 shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">100% Genuine Brands</h2>
              <p className="text-xs text-slate-600 dark:text-neutral-400 mt-0.5">
                Kikkoman, Yamasa, S&B, Kewpie, Dassai, Asahi, and certified Japanese cattle farms.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-900/80 border border-slate-200 dark:border-neutral-800 text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">QR & Telegram Pay</h2>
              <p className="text-xs text-slate-600 dark:text-neutral-400 mt-0.5">
                Instant checkout with ABA KHQR QR scanning or direct Telegram agent confirmation.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
