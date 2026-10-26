import React, { useState } from 'react';
import {
  Send,
  Phone,
  MapPin,
  FileText,
  ShieldCheck,
  Sun,
  Moon,
  Edit3,
  Check,
  X,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

const DEFAULT_PARTNER_BRANDS = [
  'Kewpie',
  'Asahi',
  'Mizkan',
  'Kikkoman',
  'Kirin',
  'Mercian',
  'TableMark',
  'Bull-Dog',
  'S&B',
  'Choya',
  'Marukome',
  'Hakutsuru',
  'Ozeki',
  'Suntory',
];

export const Footer: React.FC = () => {
  const {
    settings,
    updateSettings,
    setActiveView,
    setIsQuotationModalOpen,
    currentUser,
    theme,
    toggleTheme,
    showToast,
  } = useStore();

  const [isFooterModalOpen, setIsFooterModalOpen] = useState(false);
  const [partnerBrandsInput, setPartnerBrandsInput] = useState('');

  const isAdmin = currentUser?.role === 'admin';

  const partnerBrands = settings.partnerBrands?.length
    ? settings.partnerBrands
    : DEFAULT_PARTNER_BRANDS;

  const openFooterEditor = () => {
    setPartnerBrandsInput(partnerBrands.join(', '));
    setIsFooterModalOpen(true);
  };

  const handleSavePartnerBrands = (e: React.FormEvent) => {
    e.preventDefault();
    const brandsArray = partnerBrandsInput
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean);

    updateSettings({
      partnerBrands: brandsArray.length ? brandsArray : DEFAULT_PARTNER_BRANDS,
    });
    setIsFooterModalOpen(false);
    showToast('Footer settings updated successfully!');
  };

  return (
    <>
      <footer className="bg-slate-100 dark:bg-neutral-950 border-t border-slate-200 dark:border-neutral-850 text-slate-600 dark:text-neutral-400 text-xs transition-colors relative">
        {/* Admin Quick Footer Edit Badge */}
        {isAdmin && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 flex items-center justify-between text-[11px] text-amber-700 dark:text-amber-300">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Admin Mode: Footer copy, brand partners, and contact info are fully editable.</span>
            </span>
            <button
              onClick={openFooterEditor}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-200 font-semibold transition-colors"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit Footer Content</span>
            </button>
          </div>
        )}

        {/* Partner Logos Strip (Toggled by admin) */}
        {settings.footerShowPartnerLogos !== false && (
          <div className="border-b border-slate-200 dark:border-neutral-900 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-neutral-500 uppercase tracking-wider text-center mb-4">
              {settings.footerBrandPartnersTitle || 'Our Brand Partners & Direct Importers'}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-slate-600 dark:text-neutral-400 font-medium">
              {partnerBrands.map((brand) => (
                <span
                  key={brand}
                  className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-default"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Address */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={`${settings.storeName} Logo`}
                  className="w-8 h-8 rounded-lg object-contain bg-white dark:bg-white/10 border border-slate-200 dark:border-neutral-700/60 p-0.5 shadow-xs"
                />
              ) : (
                <div
                  style={{ backgroundColor: settings.brandColor || '#e11d48' }}
                  className="w-7 h-7 rounded-md flex items-center justify-center text-white font-bold text-sm shadow-xs"
                >
                  {settings.logoText || '旭'}
                </div>
              )}
              <span className="font-display font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                {settings.storeName}
              </span>
            </div>

            <p className="text-slate-600 dark:text-neutral-400 max-w-md leading-relaxed text-xs">
              {settings.footerDescription ||
                `${settings.tagline || 'Direct Japanese Food & Beverage Supply since 1998.'} Supplying premium hotels, authentic Japanese izakayas, sushi restaurants, and residential gourmet connoisseurs across Phnom Penh and Cambodia.`}
            </p>

            <div className="pt-2 space-y-1.5 text-xs text-slate-700 dark:text-neutral-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>{settings.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>
                  {settings.phonePrimary} / {settings.phoneSecondary}
                </span>
              </div>
              {settings.operatingHours && (
                <div className="text-[11px] text-slate-500 dark:text-neutral-400 pt-0.5">
                  Hours: {settings.operatingHours}
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              {settings.footerNavigationTitle || 'Store Navigation'}
            </h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    setActiveView('store');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Full Product Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveView('about');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  About Me & Heritage Story
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsQuotationModalOpen(true)}
                  className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-rose-500" />
                  <span>Official Quotation PDF (18 Pages)</span>
                </button>
              </li>
              {currentUser?.role === 'customer' && (
                <li>
                  <button
                    onClick={() => setActiveView('my-orders')}
                    className="hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Customer Orders & Receipts
                  </button>
                </li>
              )}
              {currentUser?.role === 'admin' && (
                <li>
                  <button
                    onClick={() => setActiveView('admin')}
                    className="hover:text-amber-600 dark:hover:text-white transition-colors text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin Operations Dashboard</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Payment & Telegram */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              {settings.footerSupportTitle || 'Instant Support & Pay'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
              {settings.footerSupportText ||
                'Order online with ABA KHQR payment confirmation or chat with our sales staff directly on Telegram for bulk quotes.'}
            </p>
            <a
              href={settings.telegramDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#229ED9]/15 hover:bg-[#229ED9]/25 text-[#229ED9] border border-[#229ED9]/30 font-medium transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram @{settings.telegramUsername}</span>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 dark:border-neutral-900 py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 dark:text-neutral-500 text-[11px]">
          <div>
            {settings.footerCopyright ||
              `© ${new Date().getFullYear()} ${settings.companyName || 'Akuruhi Cambodia Co., Ltd.'} All rights reserved.`}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span>Theme:</span>
              <button
                onClick={toggleTheme}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-neutral-700 transition-colors shadow-xs"
                title="Toggle Light / Dark mode"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            </div>
            <span>·</span>
            <span>{settings.footerLocationTag || 'Phnom Penh, Cambodia'}</span>
          </div>
        </div>
      </footer>

      {/* --- QUICK FOOTER EDIT MODAL FOR ADMINISTRATORS --- */}
      {isFooterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#11141c] rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-2xl p-6 space-y-5 my-8 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                    Edit Storefront Footer Content
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                    Administrator authority · Updates all customer footers in real time
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsFooterModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePartnerBrands} className="space-y-4 text-xs">
              {/* Brand Partners Banner Title & List */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-850 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-900 dark:text-white">
                    Brand Partners Strip
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer text-slate-700 dark:text-neutral-300">
                    <input
                      type="checkbox"
                      checked={settings.footerShowPartnerLogos !== false}
                      onChange={(e) =>
                        updateSettings({ footerShowPartnerLogos: e.target.checked })
                      }
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>Show Partner Strip</span>
                  </label>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-neutral-400 mb-1">
                    Strip Headline
                  </label>
                  <input
                    type="text"
                    value={settings.footerBrandPartnersTitle || ''}
                    placeholder="e.g. Our Brand Partners & Direct Importers"
                    onChange={(e) =>
                      updateSettings({ footerBrandPartnersTitle: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-neutral-400 mb-1">
                    Partner Brands (comma-separated list)
                  </label>
                  <textarea
                    rows={2}
                    value={partnerBrandsInput}
                    onChange={(e) => setPartnerBrandsInput(e.target.value)}
                    placeholder="Kewpie, Asahi, Mizkan, Kikkoman, Kirin, S&B, Choya..."
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-500 dark:text-neutral-500 mt-0.5 block">
                    Separate brand names with commas.
                  </span>
                </div>
              </div>

              {/* Company Description in Footer */}
              <div>
                <label className="block text-slate-700 dark:text-neutral-300 font-semibold mb-1">
                  Footer Company Description Paragraph
                </label>
                <textarea
                  rows={3}
                  value={settings.footerDescription || ''}
                  onChange={(e) => updateSettings({ footerDescription: e.target.value })}
                  placeholder="Supplying premium hotels, authentic Japanese izakayas, sushi restaurants..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Support Column Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-neutral-300 font-semibold mb-1">
                    Support Column Title
                  </label>
                  <input
                    type="text"
                    value={settings.footerSupportTitle || ''}
                    onChange={(e) => updateSettings({ footerSupportTitle: e.target.value })}
                    placeholder="e.g. Instant Support & Pay"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-neutral-300 font-semibold mb-1">
                    Navigation Column Title
                  </label>
                  <input
                    type="text"
                    value={settings.footerNavigationTitle || ''}
                    onChange={(e) => updateSettings({ footerNavigationTitle: e.target.value })}
                    placeholder="e.g. Store Navigation"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-neutral-300 font-semibold mb-1">
                  Support & Telegram Ordering Blurb
                </label>
                <textarea
                  rows={2}
                  value={settings.footerSupportText || ''}
                  onChange={(e) => updateSettings({ footerSupportText: e.target.value })}
                  placeholder="Order online with ABA KHQR payment confirmation or chat with our sales staff..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Bottom Copyright & Location Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-neutral-300 font-semibold mb-1">
                    Copyright Line
                  </label>
                  <input
                    type="text"
                    value={settings.footerCopyright || ''}
                    onChange={(e) => updateSettings({ footerCopyright: e.target.value })}
                    placeholder="© 2026 Akuruhi Cambodia Co., Ltd. All rights reserved."
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-neutral-300 font-semibold mb-1">
                    Location / City Tag
                  </label>
                  <input
                    type="text"
                    value={settings.footerLocationTag || ''}
                    onChange={(e) => updateSettings({ footerLocationTag: e.target.value })}
                    placeholder="Phnom Penh, Cambodia"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsFooterModalOpen(false);
                    setActiveView('admin');
                  }}
                  className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 font-medium"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Open Full Admin Dashboard</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFooterModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-slate-700 dark:text-neutral-300 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-xs shadow-rose-950"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Save Footer Changes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
