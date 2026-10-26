import React, { useState } from 'react';
import {
  ShoppingBag,
  User,
  ShieldCheck,
  FileText,
  Send,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Compass,
  KeyRound,
  Sun,
  Moon,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Header: React.FC = () => {
  const {
    cartCount,
    setIsCartOpen,
    currentUser,
    logout,
    setIsAuthModalOpen,
    activeView,
    setActiveView,
    setIsQuotationModalOpen,
    settings,
    theme,
    toggleTheme,
  } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const isAdmin = currentUser?.role === 'admin';
  const isCustomer = currentUser?.role === 'customer';

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-[#0d0f14]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-neutral-800/80 shadow-xs transition-colors duration-200">
      {/* Top Quiet Announcement Bar */}
      <div className="bg-slate-100 dark:bg-neutral-950/90 text-slate-600 dark:text-neutral-400 text-xs py-1.5 px-4 border-b border-slate-200/80 dark:border-neutral-850 flex items-center justify-between transition-colors">
        <div className="mx-auto flex items-center gap-2 truncate max-w-4xl text-center">
          <span className="text-rose-600 dark:text-rose-500 font-semibold tracking-wide">AKURUHI PHNOM PENH</span>
          <span className="text-slate-400 dark:text-neutral-600">·</span>
          <span className="truncate">{settings.announcementText}</span>
        </div>
        <div className="hidden lg:flex items-center gap-3 text-slate-600 dark:text-neutral-400 text-xs shrink-0">
          <a
            href={settings.telegramDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-1"
          >
            <Send className="w-3 h-3 text-sky-500 dark:text-sky-400" />
            <span>@{settings.telegramUsername}</span>
          </a>
          <span className="text-slate-300 dark:text-neutral-700">·</span>
          <span>{settings.phonePrimary}</span>
        </div>
      </div>

      {/* Main Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={() => setActiveView('store')}
            className="flex items-center gap-2.5 text-left group"
          >
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={`${settings.storeName} Logo`}
                className="w-9 h-9 rounded-lg object-contain bg-neutral-100 dark:bg-white/10 border border-slate-200 dark:border-neutral-700/60 p-0.5 shadow-xs"
              />
            ) : (
              <div
                style={{ backgroundColor: settings.brandColor || '#e11d48' }}
                className="w-8 h-8 rounded-md flex items-center justify-center font-display font-extrabold text-white text-base shadow-sm shadow-rose-950/20"
              >
                {settings.logoText || '旭'}
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-neutral-200 transition-colors whitespace-nowrap">
                {settings.storeName}
              </span>
              <span className="text-[10px] tracking-widest text-slate-500 dark:text-neutral-400 uppercase truncate max-w-[180px] sm:max-w-xs">
                {settings.tagline || 'Japanese Food & Beverage Supply'}
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Strict RBAC visibility) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-neutral-300">
          <button
            onClick={() => setActiveView('store')}
            className={`whitespace-nowrap transition-colors hover:text-slate-900 dark:hover:text-white ${
              activeView === 'store' ? 'text-rose-600 dark:text-rose-400 font-semibold' : ''
            }`}
          >
            Storefront
          </button>

          <button
            onClick={() => setActiveView('about')}
            className={`flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-slate-900 dark:hover:text-white ${
              activeView === 'about' ? 'text-rose-600 dark:text-rose-400 font-semibold' : ''
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-400" />
            <span>About Me</span>
          </button>

          <button
            onClick={() => setIsQuotationModalOpen(true)}
            className="flex items-center gap-1.5 whitespace-nowrap hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-400" />
            <span>Quotation PDF</span>
          </button>

          {/* MY ORDERS: ONLY visible to user accounts (customers / guests), NEVER displayed for administrator */}
          {!isAdmin && (
            <button
              onClick={() => {
                if (!currentUser) {
                  setIsAuthModalOpen(true);
                } else {
                  setActiveView('my-orders');
                }
              }}
              className={`whitespace-nowrap transition-colors hover:text-slate-900 dark:hover:text-white ${
                activeView === 'my-orders' ? 'text-rose-600 dark:text-rose-400 font-semibold' : ''
              }`}
            >
              My Orders
            </button>
          )}

          {/* ADMIN DASHBOARD: ONLY visible to administrator accounts, NEVER displayed for customer accounts */}
          {isAdmin && (
            <button
              onClick={() => setActiveView('admin')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-all ${
                activeView === 'admin'
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 font-semibold shadow-xs'
                  : 'text-amber-600 dark:text-amber-400/90 border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>Admin Dashboard</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
            </button>
          )}
        </nav>

        {/* Zone 3: Actions (Theme Toggle, Cart & Account Pill) */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            className="p-2 rounded-xl border border-slate-200 dark:border-neutral-750 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800/80 dark:hover:bg-neutral-750 text-slate-700 dark:text-neutral-200 transition-all active:scale-95 flex items-center justify-center shadow-xs cursor-pointer group"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 group-hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          {/* Quick User Account Dropdown / Auth Button */}
          <div className="relative">
            {currentUser ? (
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap ${
                  isAdmin
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-500/40 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                    : 'bg-slate-100 dark:bg-neutral-800/80 text-slate-800 dark:text-neutral-200 border-slate-200 dark:border-neutral-700/60 hover:bg-slate-200 dark:hover:bg-neutral-800'
                }`}
              >
                {isAdmin ? (
                  <div className="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[10px] text-amber-700 dark:text-amber-300 font-bold">
                    <KeyRound className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-rose-600/10 dark:bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-[10px] text-rose-600 dark:text-rose-300 font-bold">
                    <User className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                  </div>
                )}
                <div className="text-left flex flex-col">
                  <span className="font-semibold text-[11px] truncate max-w-[110px]">
                    {currentUser.name}
                  </span>
                  <span
                    className={`text-[9px] uppercase tracking-wider font-extrabold ${
                      isAdmin ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-neutral-400'
                    }`}
                  >
                    {isAdmin ? 'Administrator' : 'Customer Account'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-400 ml-0.5" />
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-750 text-slate-700 dark:text-neutral-200 text-xs font-medium border border-slate-200 dark:border-neutral-700 transition-colors whitespace-nowrap"
              >
                <User className="w-3.5 h-3.5 text-slate-500 dark:text-neutral-400" />
                <span>Sign In / Register</span>
              </button>
            )}

            {/* Dropdown Menu */}
            {isUserDropdownOpen && currentUser && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#12151d] border border-slate-200 dark:border-neutral-800 shadow-2xl py-2.5 z-50 text-xs transition-colors"
                onMouseLeave={() => setIsUserDropdownOpen(false)}
              >
                {/* Account Details Header */}
                <div className="px-4 py-2 border-b border-slate-200 dark:border-neutral-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isAdmin
                          ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {isAdmin ? 'System Administrator' : 'Customer Account'}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white truncate text-sm">{currentUser.name}</p>
                  <p className="text-slate-500 dark:text-neutral-400 text-[11px] truncate">
                    {currentUser.email || currentUser.phone || currentUser.loginIdentifier}
                  </p>
                </div>

                <div className="py-1">
                  {/* Appearance Mode quick toggle in dropdown */}
                  <button
                    onClick={toggleTheme}
                    className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      {theme === 'dark' ? (
                        <Sun className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Moon className="w-3.5 h-3.5 text-slate-600" />
                      )}
                      <span>Appearance</span>
                    </span>
                    <span className="text-[10px] font-mono font-medium uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 border border-slate-200 dark:border-neutral-700">
                      {theme === 'dark' ? 'Dark' : 'Light'}
                    </span>
                  </button>

                  {/* Admin specific navigation */}
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setActiveView('admin');
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-neutral-800 text-amber-700 dark:text-amber-300 flex items-center gap-2 transition-colors font-medium"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Admin Management Dashboard</span>
                    </button>
                  )}

                  {/* Customer specific navigation: Never visible for admin */}
                  {isCustomer && (
                    <button
                      onClick={() => {
                        setActiveView('my-orders');
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      View My Orders & History
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setActiveView('about');
                      setIsUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2"
                  >
                    <Compass className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-400" />
                    <span>About Akuruhi</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsQuotationModalOpen(true);
                      setIsUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-400" />
                    <span>March 2026 Quotation PDF</span>
                  </button>
                </div>

                <div className="border-t border-slate-200 dark:border-neutral-800 pt-1">
                  <button
                    onClick={() => {
                      logout();
                      setIsUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-slate-100 dark:hover:bg-neutral-800 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Cart Bag Button (Only visible for customer/guest accounts, removed for admin) */}
          {!isAdmin && (
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="View shopping cart"
              style={{ backgroundColor: settings.brandColor || '#e11d48' }}
              className="relative flex items-center justify-center p-2.5 rounded-xl hover:opacity-90 text-white transition-all shadow-md shadow-rose-950/20 active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-neutral-950 font-mono font-bold text-[11px] flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-neutral-950 border-b border-slate-200 dark:border-neutral-800 px-4 py-3 space-y-2 transition-colors">
          <button
            onClick={() => {
              setActiveView('store');
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-sm text-slate-700 dark:text-neutral-200 hover:text-slate-900 dark:hover:text-white"
          >
            Storefront Catalog
          </button>

          <button
            onClick={() => {
              setActiveView('about');
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-sm text-slate-700 dark:text-neutral-200 hover:text-slate-900 dark:hover:text-white flex items-center gap-2"
          >
            <Compass className="w-4 h-4 text-slate-400 dark:text-neutral-400" />
            <span>About Me & Story</span>
          </button>

          <button
            onClick={() => {
              setIsQuotationModalOpen(true);
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-sm text-slate-700 dark:text-neutral-200 hover:text-slate-900 dark:hover:text-white flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-slate-400 dark:text-neutral-400" />
            <span>Official Quotation PDF</span>
          </button>

          {/* Only visible to user accounts (never administrator) */}
          {!isAdmin && (
            <button
              onClick={() => {
                if (!currentUser) setIsAuthModalOpen(true);
                else setActiveView('my-orders');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 text-sm text-slate-700 dark:text-neutral-200 hover:text-slate-900 dark:hover:text-white"
            >
              My Orders
            </button>
          )}

          {/* Only visible to administrator (never customer) */}
          {isAdmin && (
            <button
              onClick={() => {
                setActiveView('admin');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-2 font-semibold"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </button>
          )}

          {/* Mobile Theme Toggle Item */}
          <div className="pt-2 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-between py-1">
            <span className="text-sm text-slate-600 dark:text-neutral-400 flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <span>Theme Mode</span>
            </span>
            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-slate-800 dark:text-neutral-200"
            >
              Switch to {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
