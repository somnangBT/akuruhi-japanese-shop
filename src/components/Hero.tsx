import React from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  Send,
  ShoppingCart,
  Truck,
  Award,
  ShieldCheck,
  Facebook,
  Instagram,
  Phone,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { HERO_BANNER_IMAGE } from '../data/initialProducts';

export const Hero: React.FC = () => {
  const { setIsQuotationModalOpen, settings, theme } = useStore();

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
              filter:
                theme === 'dark'
                  ? `brightness(${1 - (settings.backgroundDarkness ?? 0.75) * 0.7}) blur(${settings.backgroundBlur || 0}px)`
                  : `brightness(1.02) blur(${settings.backgroundBlur || 0}px) contrast(1.05)`,
            }}
            className="w-full h-full object-cover object-center saturate-[0.9] opacity-40 dark:opacity-100 transition-all duration-300"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/90 to-slate-50/60 dark:from-[#0b0d10] dark:via-[#0b0d10]/70 dark:to-[#0b0d10]/30 transition-colors duration-300"
            style={{
              backgroundColor:
                theme === 'dark'
                  ? `rgba(11, 13, 16, ${(settings.backgroundDarkness ?? 0.75) * 0.5})`
                  : `rgba(255, 255, 255, ${(settings.backgroundDarkness ?? 0.75) * 0.55})`,
            }}
          />
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
        <div className="max-w-3xl space-y-5">
          {/* Subtle Trust Label */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-rose-500/10 dark:bg-rose-950/40 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs font-semibold shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span className="leading-snug">
              {settings.heroBadgeText || 'Akuruhi Cambodia · Since 1998 · Phnom Penh Wholesale & Retail'}
            </span>
          </motion.div>

          {/* Main Headline */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-slate-900 dark:text-white tracking-tight flex items-baseline gap-2 mb-2"
            >
              <span>{settings.storeName.split(' ')[0] || 'Akuruhi'}</span>
              <span className="text-rose-600 dark:text-rose-500 text-xl sm:text-2xl lg:text-3xl font-extrabold">
                {settings.storeName.split(' ').slice(1).join(' ') || 'Japanese Supply'}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.18]"
              style={{ textWrap: 'balance' }}
            >
              {settings.heroTitle || 'Authentic Japanese Food & Beverage Supply for Cambodia.'}
            </motion.h1>
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-sm sm:text-base lg:text-lg text-slate-700 dark:text-neutral-300 leading-relaxed max-w-2xl"
          >
            {settings.heroSubtitle ||
              'From A5 Japanese Wagyu and Toyosu bluefin tuna to brewed soy sauces, golden curries, and Dassai Junmai Daiginjo sake. Direct import with cold-chain guarantee.'}
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1"
          >
            <button
              onClick={scrollToCatalog}
              style={{ backgroundColor: settings.brandColor || '#e11d48' }}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-medium text-sm transition-opacity hover:opacity-90 shadow-lg shadow-rose-950/20 active:scale-[0.98] whitespace-nowrap cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Explore Products (មើលមុខទំនិញ)</span>
            </button>

            <a
              href={settings.telegramDirectUrl || `https://t.me/${settings.telegramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#229ED9] hover:bg-[#1e8ec3] text-white font-medium text-sm transition-all shadow-lg shadow-sky-950/20 active:scale-[0.98] whitespace-nowrap cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Order via Telegram</span>
            </a>

            <button
              onClick={() => setIsQuotationModalOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/95 dark:bg-neutral-900/90 hover:bg-white dark:hover:bg-neutral-800 text-slate-800 dark:text-neutral-200 border border-slate-300 dark:border-neutral-700 font-medium text-sm transition-colors shadow-xs whitespace-nowrap cursor-pointer"
            >
              <FileText className="w-4 h-4 text-slate-500 dark:text-neutral-400" />
              <span>Quotation PDF</span>
            </button>
          </motion.div>

          {/* Quick Contact & Socials: Telegram, Facebook, Instagram, Phone Number */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="flex flex-wrap items-center gap-2 pt-2"
          >
            <span className="text-[11px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mr-1">
              Contact:
            </span>

            {/* 1. Telegram */}
            <a
              href={settings.telegramDirectUrl || `https://t.me/${settings.telegramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#229ED9]/15 hover:bg-[#229ED9]/25 text-[#229ED9] border border-[#229ED9]/40 text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Chat with us on Telegram"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram</span>
            </a>

            {/* 2. Facebook */}
            <a
              href={settings.facebookUrl || 'https://facebook.com/akuruhicambodia'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1877F2]/15 hover:bg-[#1877F2]/25 text-[#1877F2] border border-[#1877F2]/40 text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Visit our Facebook Page"
            >
              <Facebook className="w-3.5 h-3.5" />
              <span>Facebook</span>
            </a>

            {/* 3. Instagram */}
            <a
              href={settings.instagramUrl || 'https://instagram.com/akuruhicambodia'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 text-pink-600 dark:text-pink-400 border border-pink-500/40 text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Follow us on Instagram"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>Instagram</span>
            </a>

            {/* 4. Phone Number (Call) */}
            <a
              href={`tel:${settings.phonePrimary.replace(/[^0-9+]/g, '')}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40 text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
              title={`Call ${settings.phonePrimary}`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{settings.phonePrimary}</span>
            </a>
          </motion.div>
        </div>

        {/* 3-Column Trust Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-14 pt-8 border-t border-slate-200 dark:border-neutral-800/80 grid grid-cols-1 sm:grid-cols-3 gap-6"
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
