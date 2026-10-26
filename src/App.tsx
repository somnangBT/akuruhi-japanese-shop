'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCatalog } from './components/ProductCatalog';
import { AdminDashboard } from './components/AdminDashboard';
import { CustomerOrdersView } from './components/CustomerOrdersView';
import { AboutMeSection } from './components/AboutMeSection';
import { CartDrawer } from './components/CartDrawer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { AuthGate } from './components/AuthGate';
import { QuotationPdfModal } from './components/QuotationPdfModal';
import { Footer } from './components/Footer';

import { ShieldAlert } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeView, setActiveView, toast, settings, currentUser, setIsAuthModalOpen, theme } = useStore();

  const isFullStoreBg = settings.backgroundScope === 'entire_store' && settings.backgroundImageUrl;

  const brandStyle = {
    '--brand-color': settings.brandColor || '#e11d48',
    '--brand-color-hover': settings.brandColorHover || '#f43f5e',
  } as React.CSSProperties;

  // Enforce mandatory user registration or login before accessing the website
  if (!currentUser) {
    return (
      <div
        style={brandStyle}
        className="relative min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b0d10] text-slate-900 dark:text-neutral-100 selection:bg-rose-600 selection:text-white transition-colors duration-200"
      >
        <AuthGate />
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-5 right-5 z-50 max-w-sm px-4 py-3 rounded-xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md text-slate-900 dark:text-white text-xs font-medium border border-slate-200 dark:border-neutral-750 shadow-2xl flex items-center gap-2.5"
            >
              <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span className="leading-snug">{toast}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div
      style={brandStyle}
      className="relative min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b0d10] text-slate-900 dark:text-neutral-100 selection:bg-rose-600 selection:text-white transition-colors duration-200"
    >
      {/* Optional Whole Shop Background */}
      {isFullStoreBg && (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <img
            src={settings.backgroundImageUrl}
            alt="Shop background"
            className="w-full h-full object-cover object-center transition-all duration-300"
            style={{
              filter:
                theme === 'dark'
                  ? `brightness(${1 - (settings.backgroundDarkness ?? 0.75) * 0.75}) blur(${settings.backgroundBlur || 0}px)`
                  : `brightness(${0.98 + (1 - (settings.backgroundDarkness ?? 0.75)) * 0.15}) blur(${settings.backgroundBlur || 0}px) contrast(1.05)`,
              opacity: theme === 'dark' ? 1 : 0.45,
            }}
          />
          <div
            className="absolute inset-0 transition-colors duration-300"
            style={{
              backgroundColor:
                theme === 'dark'
                  ? `rgba(11, 13, 16, ${settings.backgroundDarkness ?? 0.75})`
                  : `rgba(248, 250, 252, ${Math.min(0.96, Math.max(0.60, settings.backgroundDarkness ?? 0.75))})`,
            }}
          />
        </div>
      )}

      {/* Top Bar Navigation - Fixed / Sticky Header for User & Admin */}
      <div className="sticky top-0 z-50 w-full">
        <Header />
      </div>

      {/* Main View Router */}
      <main className="relative z-10 flex-1">
        {activeView === 'admin' && (
          currentUser?.role === 'admin' ? (
            <AdminDashboard />
          ) : (
            <div className="max-w-md mx-auto my-24 p-8 rounded-2xl bg-white dark:bg-[#11141c] border border-slate-200 dark:border-neutral-800 text-center space-y-4 shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 dark:text-amber-400 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                Admin Dashboard Restricted
              </h2>
              <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                The operations and inventory dashboard is only visible to authenticated store administrators and directors. Customer accounts do not have access.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => setActiveView('store')}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-slate-700 dark:text-neutral-200 text-xs font-semibold transition-colors"
                >
                  Return to Storefront
                </button>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  style={{ backgroundColor: settings.brandColor || '#e11d48' }}
                  className="px-4 py-2.5 rounded-xl text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  Staff Sign In
                </button>
              </div>
            </div>
          )
        )}
        {activeView === 'my-orders' && currentUser?.role === 'customer' && <CustomerOrdersView />}
        {activeView === 'about' && <AboutMeSection />}
        {activeView === 'store' && (
          <>
            <Hero />
            <ProductCatalog />
          </>
        )}
      </main>

      {/* Global Interactive Drawers & Modals */}
      {currentUser?.role !== 'admin' && <CartDrawer />}
      <ProductDetailModal />
      {currentUser?.role !== 'admin' && <CheckoutModal />}
      <AuthModal />
      <QuotationPdfModal />

      {/* Footer */}
      <Footer />

      {/* Toast Notification Container */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-5 right-5 z-50 max-w-sm px-4 py-3 rounded-xl bg-neutral-900/95 backdrop-blur-md text-white text-xs font-medium border border-neutral-750 shadow-2xl flex items-center gap-2.5"
          >
            <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <span className="leading-snug">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
