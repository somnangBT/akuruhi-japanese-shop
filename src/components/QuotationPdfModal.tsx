import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Download,
  FileText,
  ExternalLink,
  ShieldCheck,
  Upload,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Layers,
  BookOpen,
  Sparkles,
  ShoppingBag,
  RotateCcw,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

const TOTAL_PAGES = 18;
const QUOTATION_PAGES = Array.from({ length: TOTAL_PAGES }, (_, i) => {
  const num = String(i + 1).padStart(2, '0');
  return `/assets/quotation_pages/page_${num}.jpg`;
});

const CATALOG_SECTIONS = [
  { label: 'Cover & Index', page: 1 },
  { label: 'Sashimi & Wagyu', page: 2 },
  { label: 'Sauces & Seasoning', page: 5 },
  { label: 'Curry & Spices', page: 9 },
  { label: 'Rice & Noodles', page: 12 },
  { label: 'Sake & Beer', page: 15 },
];

export const QuotationPdfModal: React.FC = () => {
  const {
    isQuotationModalOpen,
    setIsQuotationModalOpen,
    settings,
    updateQuotationPdf,
    currentUser,
    saveUploadedImage,
    showToast,
    setActiveView,
  } = useStore();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [viewMode, setViewMode] = useState<'reader' | 'continuous' | 'embed'>('reader');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser?.role === 'admin';

  // Keyboard navigation for previous/next page
  useEffect(() => {
    if (!isQuotationModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode === 'reader') {
        if (e.key === 'ArrowRight' || e.key === 'PageDown') {
          setCurrentPage((prev) => Math.min(TOTAL_PAGES, prev + 1));
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          setCurrentPage((prev) => Math.max(1, prev - 1));
        }
      }
      if (e.key === 'Escape' && !isFullscreen) {
        setIsQuotationModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuotationModalOpen, viewMode, isFullscreen, setIsQuotationModalOpen]);

  if (!isQuotationModalOpen) return null;

  const pdfUrl =
    settings.quotationPdfUrl ||
    '/assets/aistudio/March_2026_Product_quotation_ORIGINAL_2944b3e5.pdf';
  const fileName =
    settings.quotationFileName || 'Akuruhi_Cambodia_Product_Quotation_March_2026.pdf';
  const lastUpdated = settings.quotationLastUpdated || 'March 15, 2026';

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        showToast('Please select a valid PDF file.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const resultUrl = reader.result as string;
        updateQuotationPdf(resultUrl, file.name);
        showToast(`Quotation PDF "${file.name}" uploaded successfully!`);

        try {
          await saveUploadedImage(resultUrl, 'quotation', file.name);
        } catch {
          // ignore
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(200, Math.max(60, prev + delta)));
  };

  const resetZoom = () => setZoomLevel(100);

  const jumpToPage = (pageNum: number) => {
    setCurrentPage(pageNum);
    if (viewMode === 'continuous') {
      const el = document.getElementById(`quotation-page-${pageNum}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className={`relative w-full bg-white dark:bg-[#11141c] rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-neutral-100 transition-all ${
            isFullscreen ? 'fixed inset-0 rounded-none h-screen max-w-none z-50' : 'max-w-6xl h-[92vh]'
          }`}
        >
          {/* Top Header Bar */}
          <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between bg-slate-50 dark:bg-neutral-950 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-rose-600/15 text-rose-600 dark:text-rose-500 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                    Official Akuruhi Product Quotation
                  </h2>
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
                    18 Pages
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono flex items-center gap-2 truncate">
                  <span>AKURUHI CAMBODIA</span>
                  <span>·</span>
                  <span className="truncate max-w-[140px] sm:max-w-xs">{fileName}</span>
                  <span>·</span>
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                    <Calendar className="w-3 h-3" />
                    <span>Updated {lastUpdated}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Actions & Close */}
            <div className="flex items-center gap-2 shrink-0">
              {isAdmin && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-500/40 transition-colors shadow-xs"
                    title="Upload replacement PDF quotation"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span className="hidden md:inline">Replace PDF</span>
                  </button>
                </div>
              )}

              <a
                href={pdfUrl}
                download={fileName}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-xs shadow-rose-950 transition-colors"
                title="Download official PDF (25 MB)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </a>

              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-neutral-850 hover:bg-slate-200 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-200 text-xs border border-slate-300 dark:border-neutral-700 transition-colors"
                title="Open raw PDF file in new browser tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Open in Tab</span>
              </a>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="hidden sm:flex p-2 rounded-lg text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsQuotationModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                title="Close quotation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Interactive Toolbar: Mode Switcher, Zoom & Page Stepper */}
          <div className="px-4 py-2 sm:px-5 bg-slate-100 dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
            {/* View Mode Tabs */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-200/70 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800">
              <button
                onClick={() => setViewMode('reader')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                  viewMode === 'reader'
                    ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-rose-500" />
                <span>Page View</span>
              </button>

              <button
                onClick={() => setViewMode('continuous')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                  viewMode === 'continuous'
                    ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-sky-500" />
                <span>All 18 Pages</span>
              </button>

              <button
                onClick={() => setViewMode('embed')}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                  viewMode === 'embed'
                    ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                <span>Raw Browser PDF</span>
              </button>
            </div>

            {/* Page Navigation Stepper (When in Reader mode) */}
            {viewMode === 'reader' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="p-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-neutral-750 transition-colors"
                  title="Previous page (Left arrow)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1 font-mono text-xs">
                  <span className="text-slate-500 dark:text-neutral-400">Page</span>
                  <select
                    value={currentPage}
                    onChange={(e) => setCurrentPage(parseInt(e.target.value, 10))}
                    className="px-2 py-1 rounded-md bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-rose-500"
                  >
                    {Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  <span className="text-slate-500 dark:text-neutral-400">of {TOTAL_PAGES}</span>
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(TOTAL_PAGES, p + 1))}
                  disabled={currentPage >= TOTAL_PAGES}
                  className="p-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-neutral-750 transition-colors"
                  title="Next page (Right arrow)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Zoom Controls */}
            {viewMode !== 'embed' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleZoom(-15)}
                  disabled={zoomLevel <= 60}
                  className="p-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-200 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-neutral-750 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={resetZoom}
                  className="px-2 py-1 rounded-md bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 text-slate-800 dark:text-neutral-200 font-mono text-[11px] hover:border-slate-400 dark:hover:border-neutral-600 transition-colors"
                  title="Click to reset zoom to 100%"
                >
                  {zoomLevel}%
                </button>

                <button
                  onClick={() => handleZoom(15)}
                  disabled={zoomLevel >= 200}
                  className="p-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-200 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-neutral-750 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Quick Category Jump Pills */}
          <div className="px-4 py-2 bg-slate-50 dark:bg-neutral-950 border-b border-slate-200 dark:border-neutral-800 text-[11px] flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            <span className="text-slate-500 dark:text-neutral-500 font-semibold whitespace-nowrap mr-1">
              Jump to Section:
            </span>
            {CATALOG_SECTIONS.map((sec) => {
              const isActive = currentPage === sec.page;
              return (
                <button
                  key={sec.label}
                  onClick={() => jumpToPage(sec.page)}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition-all ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-xs font-semibold'
                      : 'bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-neutral-700'
                  }`}
                >
                  {sec.label} (p.{sec.page})
                </button>
              );
            })}
          </div>

          {/* Main Content Area */}
          <div
            ref={pageContainerRef}
            className="flex-1 bg-slate-200/80 dark:bg-neutral-950/90 relative overflow-auto p-4 flex items-center justify-center"
          >
            {/* 1. Page-by-Page Interactive View */}
            {viewMode === 'reader' && (
              <div className="flex flex-col items-center justify-center w-full min-h-full">
                <div
                  className="transition-transform duration-200 shadow-2xl rounded-xl overflow-hidden border border-slate-300 dark:border-neutral-800 bg-white"
                  style={{
                    width: `${Math.round(820 * (zoomLevel / 100))}px`,
                    maxWidth: zoomLevel <= 100 ? '100%' : 'none',
                  }}
                >
                  <img
                    src={QUOTATION_PAGES[currentPage - 1]}
                    alt={`Quotation Page ${currentPage}`}
                    className="w-full h-auto block select-none pointer-events-auto"
                    loading="eager"
                  />
                </div>

                <div className="mt-3 text-xs text-slate-500 dark:text-neutral-400 font-mono text-center">
                  Page {currentPage} of {TOTAL_PAGES} · Use Left/Right keys or buttons above to flip pages
                </div>
              </div>
            )}

            {/* 2. Continuous Document Scroll View */}
            {viewMode === 'continuous' && (
              <div className="flex flex-col items-center gap-6 w-full py-4">
                {QUOTATION_PAGES.map((pageSrc, idx) => (
                  <div
                    key={idx}
                    id={`quotation-page-${idx + 1}`}
                    className="flex flex-col items-center"
                    style={{
                      width: `${Math.round(860 * (zoomLevel / 100))}px`,
                      maxWidth: zoomLevel <= 100 ? '100%' : 'none',
                    }}
                  >
                    <div className="self-start text-[11px] font-mono font-bold text-slate-500 dark:text-neutral-400 mb-1 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-300 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 inline-flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span>Page {idx + 1} of {TOTAL_PAGES}</span>
                    </div>
                    <div className="shadow-2xl rounded-xl overflow-hidden border border-slate-300 dark:border-neutral-800 bg-white w-full">
                      <img
                        src={pageSrc}
                        alt={`Quotation Page ${idx + 1}`}
                        className="w-full h-auto block"
                        loading={idx < 3 ? 'eager' : 'lazy'}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 3. Raw Browser PDF Embed View */}
            {viewMode === 'embed' && (
              <div className="w-full h-full flex flex-col">
                <object
                  data={`${pdfUrl}#toolbar=1&navpanes=1`}
                  type="application/pdf"
                  className="w-full flex-1 border-0 rounded-xl overflow-hidden shadow-inner bg-neutral-900"
                >
                  <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 max-w-md mx-auto my-auto bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xl">
                    <FileText className="w-12 h-12 text-rose-500" />
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      Browser PDF Plugin Notice
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                      Your browser security settings prevent direct embedding of raw PDF objects inside preview frames. Please switch to the built-in <strong>Page View</strong> tab or download the official PDF directly.
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => setViewMode('reader')}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
                      >
                        Switch to Page View
                      </button>
                      <a
                        href={pdfUrl}
                        download={fileName}
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-750 text-slate-700 dark:text-neutral-200 text-xs font-semibold border border-slate-300 dark:border-neutral-700"
                      >
                        Download PDF
                      </a>
                    </div>
                  </div>
                </object>
              </div>
            )}
          </div>

          {/* Bottom Thumbnail Strip (Quick Click Jump) */}
          {viewMode === 'reader' && (
            <div className="px-4 py-2.5 bg-slate-100 dark:bg-neutral-950 border-t border-slate-200 dark:border-neutral-800 flex items-center gap-2 overflow-x-auto scrollbar-thin shrink-0">
              <span className="text-[10px] font-mono text-slate-500 dark:text-neutral-500 uppercase tracking-wider shrink-0 mr-1">
                Pages:
              </span>
              {QUOTATION_PAGES.map((thumbSrc, idx) => {
                const pageNum = idx + 1;
                const isCurrent = currentPage === pageNum;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`relative w-11 h-14 rounded-md overflow-hidden border shrink-0 transition-all ${
                      isCurrent
                        ? 'border-rose-500 ring-2 ring-rose-500/50 scale-105 shadow-md'
                        : 'border-slate-300 dark:border-neutral-800 opacity-60 hover:opacity-100'
                    }`}
                    title={`Go to page ${pageNum}`}
                  >
                    <img
                      src={thumbSrc}
                      alt={`Thumb ${pageNum}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[9px] text-white font-mono text-center leading-tight">
                      {pageNum}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Footer Bar */}
          <div className="p-3 bg-slate-50 dark:bg-neutral-950 border-t border-slate-200 dark:border-neutral-800 text-xs text-slate-600 dark:text-neutral-400 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-[11px]">
                All quotation items are stocked in Phnom Penh cold storage. Order directly with live QR & Telegram checkout.
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsQuotationModalOpen(false);
                  setActiveView('store');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-neutral-850 hover:bg-slate-200 dark:hover:bg-neutral-800 text-slate-800 dark:text-neutral-200 text-xs font-semibold border border-slate-300 dark:border-neutral-700 transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-rose-500" />
                <span>Browse Store Catalog</span>
              </button>

              <a
                href={pdfUrl}
                download={fileName}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-xs shadow-rose-950 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save PDF (25 MB)</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
