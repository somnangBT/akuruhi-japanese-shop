import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Send,
  ShoppingCart,
  Truck,
  Award,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Sparkles,
  UtensilsCrossed,
  Salad,
  Flame,
  Search,
  Facebook,
  Instagram,
  Phone,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { HERO_BANNER_IMAGE, DEFAULT_HERO_SLIDES } from '../data/initialProducts';
import { HeroSlide } from '../types';

const BADGE_COLOR_MAP: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  amber: {
    bg: 'bg-gradient-to-r from-amber-500 to-amber-600',
    text: 'text-slate-950 font-black',
    border: 'border-amber-300/80',
    glow: 'rgba(245, 158, 11, 0.3)',
  },
  gold: {
    bg: 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500',
    text: 'text-slate-950 font-black',
    border: 'border-yellow-200',
    glow: 'rgba(234, 179, 8, 0.35)',
  },
  rose: {
    bg: 'bg-gradient-to-r from-rose-500 to-rose-600',
    text: 'text-white font-bold',
    border: 'border-rose-400/80',
    glow: 'rgba(244, 63, 94, 0.3)',
  },
  emerald: {
    bg: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
    text: 'text-white font-bold',
    border: 'border-emerald-300/80',
    glow: 'rgba(16, 185, 129, 0.3)',
  },
  sky: {
    bg: 'bg-gradient-to-r from-sky-500 to-sky-600',
    text: 'text-white font-bold',
    border: 'border-sky-300/80',
    glow: 'rgba(14, 165, 233, 0.3)',
  },
  purple: {
    bg: 'bg-gradient-to-r from-purple-500 to-purple-600',
    text: 'text-white font-bold',
    border: 'border-purple-300/80',
    glow: 'rgba(168, 85, 247, 0.3)',
  },
};

export const Hero: React.FC = () => {
  const { setIsQuotationModalOpen, settings, theme } = useStore();

  const slides: HeroSlide[] = (settings.heroSlides && settings.heroSlides.length > 0
    ? settings.heroSlides
    : DEFAULT_HERO_SLIDES
  ).filter((s) => s.isActive);

  const activeSlides = slides.length > 0 ? slides : DEFAULT_HERO_SLIDES;
  const showHeroSlides = settings.showHeroSlides ?? true;
  const autoPlay = settings.heroSlidesAutoPlay ?? true;
  const intervalSeconds = Math.max(3, settings.heroSlidesInterval ?? 5);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-slide effect (Smooth & Relaxed pace)
  useEffect(() => {
    if (!autoPlay || isPaused || isHovered || activeSlides.length <= 1) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, intervalSeconds * 1000);

    return () => clearInterval(timer);
  }, [autoPlay, isPaused, isHovered, activeSlides.length, intervalSeconds]);

  // Touch swipe support for mobile/tablets
  const touchStartXRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  };

  const handleSelectDot = (idx: number) => {
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  };

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentSlide = activeSlides[currentIndex] || activeSlides[0];

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
            className="w-full h-full object-cover object-center saturate-[0.9] opacity-35 dark:opacity-90 transition-all duration-300"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/90 to-slate-50/60 dark:from-[#0b0d10] dark:via-[#0b0d10]/85 dark:to-[#0b0d10]/40 transition-colors duration-300"
            style={{
              backgroundColor:
                theme === 'dark'
                  ? `rgba(11, 13, 16, ${(settings.backgroundDarkness ?? 0.75) * 0.6})`
                  : `rgba(255, 255, 255, ${(settings.backgroundDarkness ?? 0.75) * 0.65})`,
            }}
          />
        </div>
      )}

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center">
          {/* ========================================================= */}
          {/* LEFT COLUMN: Headings, Khmer text, buttons, controls     */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-4 sm:space-y-5">
            {/* Top Festive Khmer Ribbon / Announcement */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold shadow-xs"
            >
              <span className="text-sm">🏮</span>
              <span className="truncate">
                {settings.heroBadgeText || 'អបអរសាទរពិធីបុណ្យចូលឆ្នាំថ្មី · អាហារជប៉ុនស្រស់ & សាច់គោ Wagyu A5'}
              </span>
              <span className="text-sm">🌸</span>
            </motion.div>

            {/* Store Brand / Headline */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-slate-900 dark:text-white tracking-tight flex items-baseline gap-2"
              >
                <span>{settings.storeName.split(' ')[0] || 'Akuruhi'}</span>
                <span className="text-rose-600 dark:text-rose-500 text-xl sm:text-2xl lg:text-3xl font-extrabold">
                  Japanese Supply
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.2] mt-1 text-balance"
              >
                {settings.heroTitle || 'ម្ហូបជប៉ុនលំដាប់កំពូល & គ្រឿងផ្សំស្រស់ធម្មជាតិ'}
              </motion.h1>
            </div>

            {/* Subtitle / Description */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-xs sm:text-sm text-slate-700 dark:text-neutral-300 leading-relaxed max-w-xl"
            >
              {settings.heroSubtitle ||
                'រីករាយជាមួយមុខម្ហូបជប៉ុនរសជាតិដើម សាច់គោ Wagyu A5 ត្រីសាម៉ុងស្រស់ Toyosu Sashimi និងគ្រឿងទេសជប៉ុន ១០០% សម្រាប់គ្រួសារ និងភោជនីយដ្ឋាន ដឹកជញ្ជូនរហ័សទាន់ចិត្តដល់គេហដ្ឋាន!'}
            </motion.p>

            {/* Traditional Gold Ornamental Divider (ដូចរូបគំរូ) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center gap-3 py-1 text-amber-500/70 max-w-lg"
            >
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-400/50 to-amber-500/80" />
              <div className="flex items-center gap-1 text-xs">
                <span>✦</span>
                <span className="text-amber-500 font-bold text-sm">❖</span>
                <span>✦</span>
              </div>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-amber-400/50 to-amber-500/80" />
            </motion.div>

            {/* Action Buttons: Themed Fresh Food & Cooked buttons like in reference */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1"
            >
              {/* Button 1: Fresh Food (Green Themed) */}
              <button
                onClick={scrollToCatalog}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/20 active:scale-95 transition-all cursor-pointer"
              >
                <Salad className="w-4 h-4 text-emerald-100" />
                <span>អាហារស្រស់ៗ (Fresh Food)</span>
              </button>

              {/* Button 2: Cooked / Wagyu Fresh (Amber Themed) */}
              <button
                onClick={scrollToCatalog}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-950/20 active:scale-95 transition-all cursor-pointer"
              >
                <Flame className="w-4 h-4 text-slate-950" />
                <span>អាហារចំអិនផ្ទាល់ (Cooked Fresh)</span>
              </button>

              {/* Quotation PDF */}
              <button
                onClick={() => setIsQuotationModalOpen(true)}
                className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-white/90 dark:bg-neutral-900/90 hover:bg-white dark:hover:bg-neutral-850 text-slate-800 dark:text-neutral-200 border border-slate-300 dark:border-neutral-700 font-semibold text-xs sm:text-sm transition-colors shadow-xs active:scale-95 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Quotation PDF</span>
              </button>
            </motion.div>

            {/* Quick Contact & Socials: Telegram, Facebook, Instagram, Phone Number */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-2 pt-1"
            >
              <span className="text-[11px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mr-1">
                Contact:
              </span>

              {/* 1. Telegram */}
              <a
                href={settings.telegramDirectUrl || `https://t.me/${settings.telegramUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#229ED9]/15 hover:bg-[#229ED9]/25 text-[#229ED9] border border-[#229ED9]/40 text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
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
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1877F2]/15 hover:bg-[#1877F2]/25 text-[#1877F2] border border-[#1877F2]/40 text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
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
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 text-pink-600 dark:text-pink-400 border border-pink-500/40 text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
                title="Follow us on Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Instagram</span>
              </a>

              {/* 4. Phone Number (Call) */}
              <a
                href={`tel:${settings.phonePrimary.replace(/[^0-9+]/g, '')}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40 text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
                title={`Call ${settings.phonePrimary}`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{settings.phonePrimary}</span>
              </a>
            </motion.div>

            {/* Bottom Row on Left: Pause/Play indicator button + Trust Metrics */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              {/* Pause / Play Button (ដូចរូបគំរូ [⏸️ ផ្អាក: បិទ]) */}
              {showHeroSlides && activeSlides.length > 1 && (
                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 shadow-md text-xs font-medium transition-all active:scale-95 cursor-pointer"
                  title={isPaused ? 'Resume auto-play slide animation' : 'Pause auto-play slide animation'}
                >
                  {isPaused ? (
                    <>
                      <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                      <span>ផ្អាក: បើក (Play)</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>ផ្អាក: បិទ (Pause)</span>
                    </>
                  )}
                </button>
              )}

              {/* Trust Metric Badges underneath (ដូចរូបគំរូ: ១០០% | ១៥-២៥ នាទី | ៤.៨★) */}
              <div className="flex items-center gap-3.5 text-xs font-medium text-slate-600 dark:text-neutral-300">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">១០០%</span>
                  <span className="text-[11px] text-slate-500 dark:text-neutral-400">គុណភាពជប៉ុន</span>
                </div>
                <span className="text-slate-300 dark:text-neutral-700">·</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-amber-600 dark:text-amber-400 text-sm">១៥-៤៥ នាទី</span>
                  <span className="text-[11px] text-slate-500 dark:text-neutral-400">ដឹកជញ្ជូនរហ័ស</span>
                </div>
                <span className="text-slate-300 dark:text-neutral-700">·</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-yellow-500 text-sm">៤.៩ ★</span>
                  <span className="text-[11px] text-slate-500 dark:text-neutral-400">ការពេញចិត្ត</span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Expansive 1080 HD Hero Slide Showcase      */}
          {/* ========================================================= */}
          {showHeroSlides && (
            <div
              className="lg:col-span-7 xl:col-span-7 relative flex flex-col items-center justify-center pt-4 lg:pt-0"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Decorative Ambient Background Halo */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[500px] h-80 sm:h-[500px] bg-gradient-to-tr from-amber-500/20 via-rose-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />

              {/* Floating Decorative Badges (ដូចរូបគំរូ) */}
              {/* 1. Floating Cherry Blossom (🌸) Badge on Left */}
              <motion.div
                animate={{
                  y: [0, -8, 0],
                  rotate: [0, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -bottom-3 -left-3 sm:-left-5 z-40 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-pink-500/20 dark:bg-pink-950/70 border border-pink-400/50 backdrop-blur-md flex items-center justify-center text-2xl sm:text-3xl shadow-xl shadow-pink-950/20 pointer-events-none"
              >
                🌸
              </motion.div>

              {/* 2. Floating Golden Sparkle (✨) Badge on Right */}
              <motion.div
                animate={{
                  y: [0, 8, 0],
                  scale: [1, 1.08, 1],
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute top-1/2 -right-3 sm:-right-5 -translate-y-1/2 z-40 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-500/25 dark:bg-amber-950/70 border border-amber-400/60 backdrop-blur-md flex items-center justify-center text-xl sm:text-2xl shadow-xl shadow-amber-950/30 pointer-events-none"
              >
                ✨
              </motion.div>

              {/* 3. Floating Festival Lantern (🏮) Badge on Top-Right */}
              <motion.div
                animate={{
                  y: [0, -6, 0],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -top-3 right-8 sm:right-14 z-40 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-rose-500/20 dark:bg-rose-950/70 border border-rose-400/50 backdrop-blur-md flex items-center justify-center text-lg sm:text-xl shadow-xl pointer-events-none"
              >
                🏮
              </motion.div>

              {/* Single Feature 1080 HD Hero Card Showcase */}
              <div className="relative w-full max-w-[480px] sm:max-w-[580px] lg:max-w-[620px] xl:max-w-[660px] min-h-[380px] sm:min-h-[440px] flex items-center justify-center select-none overflow-hidden py-1 px-1">
                <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                  <motion.div
                    key={currentSlide.id}
                    custom={direction}
                    variants={{
                      enter: (dir: number) => ({
                        x: dir > 0 ? 65 : -65,
                        opacity: 0,
                        scale: 0.95,
                        filter: 'blur(3px)',
                      }),
                      center: {
                        x: 0,
                        opacity: 1,
                        scale: 1,
                        filter: 'blur(0px)',
                        transition: {
                          duration: 0.95,
                          ease: [0.16, 1, 0.3, 1],
                        },
                      },
                      exit: (dir: number) => ({
                        x: dir > 0 ? -65 : 65,
                        opacity: 0,
                        scale: 0.95,
                        filter: 'blur(3px)',
                        transition: {
                          duration: 0.85,
                          ease: [0.16, 1, 0.3, 1],
                        },
                      }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    onClick={scrollToCatalog}
                    className="w-full rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-slate-900/95 dark:bg-[#111420]/95 backdrop-blur-2xl border border-amber-400/80 shadow-[0_30px_60px_rgba(0,0,0,0.85),0_0_40px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/30 cursor-pointer will-change-transform relative"
                  >
                    {/* Active Card: Traditional Gold Corner Brackets ╔ ╝ (ដូចរូបគំរូ) */}
                    <div className="absolute top-2.5 left-2.5 w-5 h-5 border-t-2 border-l-2 border-amber-400 rounded-tl-xs pointer-events-none z-20" />
                    <div className="absolute bottom-2.5 right-2.5 w-5 h-5 border-b-2 border-r-2 border-amber-400 rounded-br-xs pointer-events-none z-20" />

                    {/* Top Badge: Warm Gradient Pill & Slide Counter */}
                    <div className="flex items-center justify-between mb-3 relative z-10">
                      <div className="text-[11px] font-mono text-slate-300 font-bold px-2.5 py-1 rounded-full bg-slate-800/90 border border-slate-700/80">
                        {currentIndex + 1} / {activeSlides.length}
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs sm:text-sm font-black tracking-wide shadow-md ${
                          (BADGE_COLOR_MAP[currentSlide.badgeColor || 'amber'] || BADGE_COLOR_MAP.amber).bg
                        } ${(BADGE_COLOR_MAP[currentSlide.badgeColor || 'amber'] || BADGE_COLOR_MAP.amber).text} border ${
                          (BADGE_COLOR_MAP[currentSlide.badgeColor || 'amber'] || BADGE_COLOR_MAP.amber).border
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span>{currentSlide.badge}</span>
                      </span>
                    </div>

                    {/* 1080 HD Widescreen (16:9) Food Image Container */}
                    <div className="relative aspect-[16/9] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-black/80 border border-slate-800 shadow-2xl group">
                      <img
                        src={currentSlide.imageUrl}
                        alt={currentSlide.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-80" />

                      {currentSlide.price && (
                        <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-amber-400/60 text-amber-300 font-mono font-black text-sm sm:text-base shadow-xl">
                          ${currentSlide.price.toFixed(2)}
                        </div>
                      )}
                    </div>

                    {/* Bottom Info: Title, Khmer text & Quick Tag */}
                    <div className="mt-4 space-y-1.5 relative z-10">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display font-black text-base sm:text-xl lg:text-2xl text-white leading-snug truncate">
                          {currentSlide.titleKhmer || currentSlide.title}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between text-xs sm:text-sm pt-0.5">
                        {currentSlide.title && currentSlide.titleKhmer ? (
                          <span className="text-xs sm:text-sm text-slate-300 truncate max-w-[280px]">
                            {currentSlide.title}
                          </span>
                        ) : (
                          <span className="text-xs sm:text-sm text-slate-300">
                            {currentSlide.subtitle || 'Akuruhi Supreme Quality'}
                          </span>
                        )}

                        {currentSlide.tag && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] sm:text-xs font-bold shrink-0">
                            <Search className="w-3 h-3" />
                            <span>{currentSlide.tag}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Slide Navigation Buttons & Dot Indicator */}
              <div className="flex items-center justify-between w-full max-w-[480px] sm:max-w-[580px] lg:max-w-[620px] xl:max-w-[660px] mt-4 px-2">
                {/* Prev Button */}
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous slide"
                  className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/70 shadow-md backdrop-blur-md active:scale-95 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Dot Indicators */}
                <div className="flex items-center gap-2">
                  {activeSlides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectDot(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      className={`h-2.5 rounded-full transition-all duration-500 cursor-pointer ${
                        i === currentIndex
                          ? 'w-10 bg-gradient-to-r from-amber-400 to-amber-500 shadow-md shadow-amber-500/40'
                          : 'w-2.5 bg-slate-400/40 dark:bg-slate-700/60 hover:bg-slate-400'
                      }`}
                    />
                  ))}
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next slide"
                  className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/70 shadow-md backdrop-blur-md active:scale-95 transition-all cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3-Column Trust Strip Below */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-12 pt-6 border-t border-slate-200 dark:border-neutral-800/80 grid grid-cols-1 sm:grid-cols-3 gap-6"
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
