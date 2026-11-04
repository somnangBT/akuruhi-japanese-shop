import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  Check,
  X,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Sparkles,
  Play,
  Pause,
  Sliders,
  AlertCircle,
  FolderOpen,
  Link,
  ChevronLeft,
  ChevronRight,
  Clock,
  Palette,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { HeroSlide } from '../types';
import {
  DEFAULT_HERO_SLIDES,
  WAGYU_IMAGE,
  SASHIMI_IMAGE,
  SAKE_IMAGE,
  HERO_BANNER_IMAGE,
  SALMON_IMAGE,
} from '../data/initialProducts';

const PRESET_IMAGES = [
  { name: 'A5 Wagyu Beef Cut', url: WAGYU_IMAGE },
  { name: 'Fresh Sashimi & Seafood', url: SASHIMI_IMAGE },
  { name: 'Norwegian Salmon Sashimi', url: SALMON_IMAGE },
  { name: 'Dassai Sake Bottle', url: SAKE_IMAGE },
  { name: 'Japanese Culinary Spread', url: HERO_BANNER_IMAGE },
];

const BADGE_COLORS: { id: HeroSlide['badgeColor']; label: string; bg: string; text: string; border: string }[] = [
  { id: 'amber', label: 'Gold / Amber (មាស)', bg: 'bg-amber-500', text: 'text-slate-950', border: 'border-amber-400' },
  { id: 'gold', label: 'Imperial Gold (មាសប្រណិត)', bg: 'bg-yellow-500', text: 'text-slate-950', border: 'border-yellow-300' },
  { id: 'rose', label: 'Rose / Red (ក្រហម)', bg: 'bg-rose-600', text: 'text-white', border: 'border-rose-400' },
  { id: 'emerald', label: 'Emerald / Green (បៃតងស្រស់)', bg: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-400' },
  { id: 'sky', label: 'Sky / Cyan (ខៀវស្រាល)', bg: 'bg-sky-600', text: 'text-white', border: 'border-sky-400' },
  { id: 'purple', label: 'Purple / Royal (ស្វាយ)', bg: 'bg-purple-600', text: 'text-white', border: 'border-purple-400' },
];

export const AdminHeroSlidesTab: React.FC = () => {
  const { settings, updateSettings, saveUploadedImage, uploadedImages, showToast } = useStore();

  const slides: HeroSlide[] = settings.heroSlides && settings.heroSlides.length > 0
    ? settings.heroSlides
    : DEFAULT_HERO_SLIDES;

  const showHeroSlides = settings.showHeroSlides ?? true;
  const autoPlay = settings.heroSlidesAutoPlay ?? true;
  const intervalSeconds = settings.heroSlidesInterval ?? 4;

  // Modal State for adding/editing slide
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [titleKhmer, setTitleKhmer] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badge, setBadge] = useState('ម្ហូបពិសេសប្រចាំហាង');
  const [badgeColor, setBadgeColor] = useState<HeroSlide['badgeColor']>('amber');
  const [tag, setTag] = useState('🔍 ចម្អិនផ្ទាល់ភ្លាមៗ');
  const [imageUrl, setImageUrl] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [actionText, setActionText] = useState('កុម្ម៉ង់ឥឡូវនេះ');
  const [actionLink, setActionLink] = useState('#catalog-section');
  const [isActive, setIsActive] = useState(true);

  // Image Source Mode ('url' | 'upload' | 'library' | 'preset')
  const [imageSourceMode, setImageSourceMode] = useState<'upload' | 'preset' | 'library' | 'url'>('preset');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Deletion state
  const [slideToDelete, setSlideToDelete] = useState<HeroSlide | null>(null);

  // Live preview interactive state
  const [previewIndex, setPreviewIndex] = useState(0);

  const openCreateModal = () => {
    setEditingSlideId(null);
    setTitle('');
    setTitleKhmer('');
    setSubtitle('');
    setBadge('ម្ហូបពិសេសចូលឆ្នាំថ្មី');
    setBadgeColor('amber');
    setTag('🔍 ចម្អិនផ្ទាល់ភ្លាមៗ');
    setImageUrl(WAGYU_IMAGE);
    setPrice(35);
    setActionText('កុម្ម៉ង់ឥឡូវនេះ');
    setActionLink('#catalog-section');
    setIsActive(true);
    setImageSourceMode('preset');
    setIsModalOpen(true);
  };

  const openEditModal = (slide: HeroSlide) => {
    setEditingSlideId(slide.id);
    setTitle(slide.title);
    setTitleKhmer(slide.titleKhmer || '');
    setSubtitle(slide.subtitle || '');
    setBadge(slide.badge);
    setBadgeColor(slide.badgeColor || 'amber');
    setTag(slide.tag || '');
    setImageUrl(slide.imageUrl);
    setPrice(slide.price ?? '');
    setActionText(slide.actionText || 'កុម្ម៉ង់ឥឡូវនេះ');
    setActionLink(slide.actionLink || '#catalog-section');
    setIsActive(slide.isActive);
    setImageSourceMode('url');
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    setIsUploading(true);
    try {
      const res = await saveUploadedImage(file, 'hero_slide', file.name);
      setImageUrl(res.url);
      showToast('Image uploaded successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveSlide = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() && !titleKhmer.trim()) {
      showToast('Please enter a title for the slide.');
      return;
    }

    if (!imageUrl.trim()) {
      showToast('Please provide an image for the slide.');
      return;
    }

    if (editingSlideId) {
      // Update existing slide
      const updated = slides.map((s) => {
        if (s.id === editingSlideId) {
          return {
            ...s,
            title: title.trim() || titleKhmer.trim(),
            titleKhmer: titleKhmer.trim() || undefined,
            subtitle: subtitle.trim() || undefined,
            badge: badge.trim() || 'ម្ហូបពិសេស',
            badgeColor,
            tag: tag.trim() || undefined,
            imageUrl: imageUrl.trim(),
            price: price === '' ? undefined : Number(price),
            actionText: actionText.trim() || undefined,
            actionLink: actionLink.trim() || undefined,
            isActive,
          };
        }
        return s;
      });
      updateSettings({ heroSlides: updated });
      showToast('Hero slide updated successfully.');
    } else {
      // Add new slide
      const newSlide: HeroSlide = {
        id: `slide-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: title.trim() || titleKhmer.trim(),
        titleKhmer: titleKhmer.trim() || undefined,
        subtitle: subtitle.trim() || undefined,
        badge: badge.trim() || 'ម្ហូបពិសេស',
        badgeColor,
        tag: tag.trim() || undefined,
        imageUrl: imageUrl.trim(),
        price: price === '' ? undefined : Number(price),
        actionText: actionText.trim() || undefined,
        actionLink: actionLink.trim() || undefined,
        isActive,
        order: slides.length + 1,
      };
      updateSettings({ heroSlides: [...slides, newSlide] });
      showToast('New hero slide added successfully!');
    }

    setIsModalOpen(false);
  };

  const handleToggleSlideActive = (slideId: string) => {
    const updated = slides.map((s) => (s.id === slideId ? { ...s, isActive: !s.isActive } : s));
    updateSettings({ heroSlides: updated });
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const reordered = [...slides];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const reorderedWithIndex = reordered.map((s, idx) => ({ ...s, order: idx + 1 }));
    updateSettings({ heroSlides: reorderedWithIndex });
  };

  const handleDeleteSlide = (slideId: string) => {
    const remaining = slides.filter((s) => s.id !== slideId);
    if (remaining.length === 0) {
      showToast('You must have at least one hero slide. Resetting to defaults instead.');
      updateSettings({ heroSlides: DEFAULT_HERO_SLIDES });
    } else {
      updateSettings({ heroSlides: remaining });
      showToast('Hero slide removed.');
    }
    setSlideToDelete(null);
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset all hero slides to default Akuruhi presentations?')) {
      updateSettings({
        showHeroSlides: true,
        heroSlides: DEFAULT_HERO_SLIDES,
        heroSlidesAutoPlay: true,
        heroSlidesInterval: 4,
      });
      showToast('Hero slides reset to factory defaults.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/5 border border-amber-500/30 dark:border-amber-500/20 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 font-semibold text-[11px] border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>3D Interactive Hero Card Slider</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Hero Slide Animation Management</span>
            <span className="text-xs font-normal text-slate-500 dark:text-neutral-400">
              (ការគ្រប់គ្រងផ្ទាំងស្លាយ 3D)
            </span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
            ប្ដូររូបភាព ចំណងជើង ផ្លាកសញ្ញា (Badge) និងចលនារំកិល Slide នៅខាងស្ដាំនៃ Homepage ដោយខ្លួនឯង។
            រូបភាពទាំងអស់នឹងបង្ហាញបែប 3D Card Stack ដ៏ប្រណិត!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleResetToDefaults}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-750 text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-neutral-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Reset to original Akuruhi slides"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-950/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>បន្ថែមស្លាយថ្មី (Add New Slide)</span>
          </button>
        </div>
      </div>

      {/* Global Slider Behavior Controls Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs">
        {/* Toggle 1: Show / Hide on Homepage */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-950/80 border border-slate-200 dark:border-neutral-800">
          <div>
            <div className="font-semibold text-xs text-slate-900 dark:text-white">
              បង្ហាញ Hero Slide នៅទំព័រដើម
            </div>
            <div className="text-[11px] text-slate-500 dark:text-neutral-400">
              Enable / Disable 3D Card Carousel
            </div>
          </div>
          <button
            type="button"
            onClick={() => updateSettings({ showHeroSlides: !showHeroSlides })}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              showHeroSlides ? 'bg-amber-500' : 'bg-slate-300 dark:bg-neutral-700'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                showHeroSlides ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Toggle 2: Auto-play */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-950/80 border border-slate-200 dark:border-neutral-800">
          <div>
            <div className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>រំកិលស្លាយស្វ័យប្រវត្តិ (Auto-Play)</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-neutral-400">
              Automatically advance slides
            </div>
          </div>
          <button
            type="button"
            onClick={() => updateSettings({ heroSlidesAutoPlay: !autoPlay })}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              autoPlay ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-neutral-700'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                autoPlay ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Speed / Interval Selector */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-950/80 border border-slate-200 dark:border-neutral-800">
          <div>
            <div className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>ល្បឿនផ្លាស់ប្ដូរ (Speed)</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-neutral-400">
              Slide interval duration
            </div>
          </div>
          <select
            value={intervalSeconds}
            onChange={(e) => updateSettings({ heroSlidesInterval: Number(e.target.value) })}
            className="bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value={2}>2 វិនាទី (2s Fast)</option>
            <option value={3}>3 វិនាទី (3s)</option>
            <option value={4}>4 វិនាទី (4s Standard)</option>
            <option value={5}>5 វិនាទី (5s Relaxed)</option>
            <option value={6}>6 វិនាទី (6s)</option>
            <option value={8}>8 វិនាទី (8s Slow)</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Slide List (Left) + Interactive 3D Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Slides List Table / Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>បញ្ជីស្លាយបច្ចុប្បន្ន (Current Slides - {slides.length})</span>
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-neutral-400">
              ប្រើសញ្ញា ▲ ▼ ដើម្បីរៀបចំលំដាប់លេចឡើង
            </span>
          </div>

          <div className="space-y-3">
            {slides.map((slide, index) => {
              const colorConfig = BADGE_COLORS.find((b) => b.id === slide.badgeColor) || BADGE_COLORS[0];
              return (
                <div
                  key={slide.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                    slide.isActive
                      ? 'bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800 shadow-xs hover:border-amber-500/40'
                      : 'bg-slate-50/70 dark:bg-neutral-950/50 border-dashed border-slate-300 dark:border-neutral-800 opacity-60'
                  }`}
                >
                  {/* Left info & thumbnail */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-16 h-14 sm:w-20 sm:h-16 rounded-lg overflow-hidden bg-slate-950 shrink-0 border border-slate-200 dark:border-neutral-750">
                      <img
                        src={slide.imageUrl}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1 left-1 px-1 rounded bg-black/70 text-white font-mono text-[9px] font-bold">
                        #{index + 1}
                      </span>
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${colorConfig.bg} ${colorConfig.text} border ${colorConfig.border}`}
                        >
                          {slide.badge}
                        </span>
                        {slide.tag && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300">
                            {slide.tag}
                          </span>
                        )}
                        {!slide.isActive && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold uppercase">
                            Inactive
                          </span>
                        )}
                      </div>

                      <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {slide.titleKhmer || slide.title}
                      </div>

                      {slide.titleKhmer && slide.title && (
                        <div className="text-[11px] text-slate-500 dark:text-neutral-400 truncate">
                          {slide.title}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Strip */}
                  <div className="flex items-center justify-end gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-neutral-800">
                    {/* Move Up */}
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveSlide(index, 'up')}
                      className="p-1.5 rounded-lg text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 disabled:opacity-30 cursor-pointer"
                      title="Move slide up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      disabled={index === slides.length - 1}
                      onClick={() => handleMoveSlide(index, 'down')}
                      className="p-1.5 rounded-lg text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 disabled:opacity-30 cursor-pointer"
                      title="Move slide down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>

                    {/* Active Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleSlideActive(slide.id)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                        slide.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-600/40'
                          : 'bg-slate-100 text-slate-500 border-slate-300 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700'
                      }`}
                    >
                      {slide.isActive ? 'Active' : 'Hidden'}
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => openEditModal(slide)}
                      className="p-1.5 rounded-lg text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="Edit Slide"
                    >
                      <Edit2 className="w-4 h-4 text-sky-500" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => setSlideToDelete(slide)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live 3D Interactive Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-500" />
              <span>មើលគំរូផ្ទាល់ (Live 3D Preview)</span>
            </h3>
            <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400">
              Slide {previewIndex + 1} of {slides.length}
            </span>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl bg-[#090b10] border border-amber-500/30 text-white relative overflow-hidden min-h-[380px] flex flex-col justify-between shadow-2xl">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top decorative pill */}
            <div className="flex items-center justify-between relative z-10 text-[11px]">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-300">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>3D Card Stack Preview</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {autoPlay ? `Auto: ${intervalSeconds}s` : 'Paused'}
              </div>
            </div>

            {/* 3D Stack Mockup */}
            <div className="relative h-64 my-auto flex items-center justify-center select-none perspective-[1000px]">
              {slides.map((s, idx) => {
                const total = slides.length;
                let offset = (idx - previewIndex) % total;
                if (offset > total / 2) offset -= total;
                if (offset < -total / 2) offset += total;

                const isActive = offset === 0;
                const isVisible = Math.abs(offset) <= 1;

                const colorCfg = BADGE_COLORS.find((b) => b.id === s.badgeColor) || BADGE_COLORS[0];

                return (
                  <div
                    key={s.id}
                    onClick={() => setPreviewIndex(idx)}
                    style={{
                      transform:
                        offset === 0
                          ? 'translateX(0) scale(1) rotate(0deg)'
                          : offset > 0
                          ? 'translateX(55px) scale(0.85) rotate(6deg)'
                          : 'translateX(-55px) scale(0.85) rotate(-6deg)',
                      zIndex: offset === 0 ? 20 : isVisible ? 10 : 5,
                      opacity: offset === 0 ? 1 : isVisible ? 0.65 : 0,
                      pointerEvents: isVisible ? 'auto' : 'none',
                      transition: 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    className={`absolute w-64 sm:w-72 rounded-2xl p-2.5 bg-[#121520] border cursor-pointer shadow-xl select-none will-change-transform ${
                      isActive
                        ? 'border-amber-400/80 shadow-[0_15px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.25)]'
                        : 'border-slate-800'
                    }`}
                  >
                    {/* Gold corner brackets for active card */}
                    {isActive && (
                      <>
                        <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-amber-400 rounded-tl-xs pointer-events-none" />
                        <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-amber-400 rounded-br-xs pointer-events-none" />
                      </>
                    )}

                    {/* Card Top Badge */}
                    <div className="flex justify-end mb-1.5">
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${colorCfg.bg} ${colorCfg.text} shadow-xs`}
                      >
                        {s.badge}
                      </span>
                    </div>

                    {/* Image */}
                    <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-black/60 relative">
                      <img src={s.imageUrl} alt={s.title} className="w-full h-full object-cover" />
                    </div>

                    {/* Bottom Title & Tag */}
                    <div className="mt-2 space-y-0.5">
                      <div className="font-bold text-xs truncate text-white">
                        {s.titleKhmer || s.title}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="truncate">{s.tag || 'ចម្អិនផ្ទាល់ភ្លាមៗ'}</span>
                        {s.price && <span className="font-mono text-amber-400 font-bold">${s.price}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation Dots & Arrow Controls */}
            <div className="flex items-center justify-between relative z-10 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPreviewIndex((prev) => (prev - 1 + slides.length) % slides.length)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPreviewIndex(i)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      i === previewIndex ? 'w-5 bg-amber-400' : 'w-1.5 bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setPreviewIndex((prev) => (prev + 1) % slides.length)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- ADD / EDIT HERO SLIDE MODAL --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-[#121520] border border-slate-200 dark:border-neutral-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {editingSlideId ? 'កែប្រែស្លាយ (Edit Hero Slide)' : 'បន្ថែមស្លាយថ្មី (Add New Hero Slide)'}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                      Configure title, Khmer text, image, badges & colors
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveSlide} className="space-y-4 text-xs">
                {/* Titles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-800 dark:text-neutral-200 mb-1 font-semibold">
                      ចំណងជើងជាភាសាខ្មែរ (Khmer Title) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ឡុកឡាក់សាច់គោ & អាម៉ុកត្រីបែបខ្មែរ"
                      value={titleKhmer}
                      onChange={(e) => setTitleKhmer(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 dark:text-neutral-200 mb-1 font-semibold">
                      English / Japanese Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. A5 Miyazaki Wagyu Ribeye"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Badge Text & Color */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-800 dark:text-neutral-200 mb-1 font-semibold">
                      ស្លាកសញ្ញាខាងលើ (Top Badge Text) <span className="text-amber-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ម្ហូបពិសេសចូលឆ្នាំថ្មី, A5 Wagyu Special"
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 dark:text-neutral-200 mb-1 font-semibold">
                      ពណ៌ផ្លាក (Badge Color Theme)
                    </label>
                    <select
                      value={badgeColor}
                      onChange={(e) => setBadgeColor(e.target.value as HeroSlide['badgeColor'])}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      {BADGE_COLORS.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Subtitle / Tag / Price */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-800 dark:text-neutral-200 mb-1 font-medium">
                      Tag ស្លាកបញ្ជាក់ខ្លី (Quick Tag)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 🔍 ចម្អិនផ្ទាល់ភ្លាមៗ or ❄️ ត្រជាក់ -20°C"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 dark:text-neutral-200 mb-1 font-medium">
                      តម្លៃបង្ហាញ (Price - USD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 110"
                      value={price}
                      onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-800 dark:text-neutral-200 mb-1 font-medium">
                    ការពិពណ៌នាសង្ខេប (Subtitle / Description)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. សាច់គោជប៉ុន A5 ជាប់កម្រិតកំពូល សាច់ទន់រលាយក្នុងមាត់"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Image Selection Tabs */}
                <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-neutral-800">
                  <label className="block text-slate-800 dark:text-neutral-200 font-semibold">
                    រូបភាពម្ហូប / ផលិតផល (Slide Image) <span className="text-rose-500">*</span>
                  </label>

                  <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setImageSourceMode('preset')}
                      className={`py-1.5 rounded-lg font-medium transition-colors ${
                        imageSourceMode === 'preset'
                          ? 'bg-white text-slate-900 shadow-xs dark:bg-neutral-800 dark:text-white'
                          : 'text-slate-500 hover:text-slate-900 dark:text-neutral-400'
                      }`}
                    >
                      Presets (គំរូ)
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSourceMode('upload')}
                      className={`py-1.5 rounded-lg font-medium transition-colors ${
                        imageSourceMode === 'upload'
                          ? 'bg-white text-slate-900 shadow-xs dark:bg-neutral-800 dark:text-white'
                          : 'text-slate-500 hover:text-slate-900 dark:text-neutral-400'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSourceMode('library')}
                      className={`py-1.5 rounded-lg font-medium transition-colors ${
                        imageSourceMode === 'library'
                          ? 'bg-white text-slate-900 shadow-xs dark:bg-neutral-800 dark:text-white'
                          : 'text-slate-500 hover:text-slate-900 dark:text-neutral-400'
                      }`}
                    >
                      Library ({uploadedImages.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSourceMode('url')}
                      className={`py-1.5 rounded-lg font-medium transition-colors ${
                        imageSourceMode === 'url'
                          ? 'bg-white text-slate-900 shadow-xs dark:bg-neutral-800 dark:text-white'
                          : 'text-slate-500 hover:text-slate-900 dark:text-neutral-400'
                      }`}
                    >
                      Image URL
                    </button>
                  </div>

                  {/* Mode 1: Presets */}
                  {imageSourceMode === 'preset' && (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-1">
                      {PRESET_IMAGES.map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => setImageUrl(preset.url)}
                          className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all group cursor-pointer ${
                            imageUrl === preset.url
                              ? 'border-amber-500 ring-2 ring-amber-500/30 scale-102'
                              : 'border-slate-200 dark:border-neutral-800 hover:border-slate-400'
                          }`}
                        >
                          <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-x-0 bottom-0 p-1 bg-black/70 text-[9px] text-white truncate text-center">
                            {preset.name}
                          </div>
                          {imageUrl === preset.url && (
                            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-[10px]">
                              ✓
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Mode 2: Direct Upload */}
                  {imageSourceMode === 'upload' && (
                    <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-neutral-750 text-center space-y-2 bg-slate-50 dark:bg-neutral-950/60">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <Upload className="w-7 h-7 mx-auto text-amber-500" />
                      <div>
                        <button
                          type="button"
                          disabled={isUploading}
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-colors cursor-pointer"
                        >
                          {isUploading ? 'កំពុងបញ្ចូលរូបភាព...' : 'ជ្រើសរើសរូបភាពពីម៉ាស៊ីន (Browse Device)'}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                        PNG, JPG, WEBP · ត្រូវបានរក្សាទុកដោយស្វ័យប្រវត្តិក្នងថតរូបភាព Admin
                      </p>
                    </div>
                  )}

                  {/* Mode 3: Library */}
                  {imageSourceMode === 'library' && (
                    <div className="max-h-40 overflow-y-auto grid grid-cols-4 sm:grid-cols-6 gap-2 p-2 bg-slate-50 dark:bg-neutral-950 rounded-xl border border-slate-200 dark:border-neutral-800">
                      {uploadedImages.length === 0 ? (
                        <div className="col-span-full py-4 text-center text-slate-500 text-xs">
                          No images uploaded yet. Use "Upload File" above.
                        </div>
                      ) : (
                        uploadedImages.map((img) => (
                          <button
                            key={img.id}
                            type="button"
                            onClick={() => setImageUrl(img.url)}
                            className={`relative rounded-lg overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                              imageUrl === img.url
                                ? 'border-amber-500 ring-2 ring-amber-500/30'
                                : 'border-slate-200 dark:border-neutral-800'
                            }`}
                          >
                            <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                          </button>
                        ))
                      )}
                    </div>
                  )}

                  {/* Mode 4: Custom URL */}
                  {imageSourceMode === 'url' && (
                    <div>
                      <input
                        type="text"
                        placeholder="https://example.com/food-dish.jpg"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  )}

                  {/* Image Preview */}
                  {imageUrl && (
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-100 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-black shrink-0">
                        <img src={imageUrl} alt="Selected preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="truncate flex-1">
                        <div className="text-[11px] font-semibold text-slate-800 dark:text-white truncate">
                          Selected Image
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">{imageUrl}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Active Checkbox */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-neutral-800">
                  <input
                    type="checkbox"
                    id="slide-active-checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-slate-300 dark:border-neutral-700 cursor-pointer"
                  />
                  <label
                    htmlFor="slide-active-checkbox"
                    className="text-xs font-semibold text-slate-800 dark:text-neutral-200 cursor-pointer"
                  >
                    បង្ហាញស្លាយនេះភ្លាមៗនៅលើទំព័រដើម (Make Slide Active)
                  </label>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    បោះបង់ (Cancel)
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-950/20 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingSlideId ? 'រក្សាទុកការកែប្រែ (Save Changes)' : 'បង្កើតស្លាយ (Add Slide)'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CONFIRM DELETE MODAL --- */}
      <AnimatePresence>
        {slideToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-3"
            >
              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-6 h-6 shrink-0" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  លុបស្លាយនេះចេញ? (Delete Hero Slide?)
                </h4>
              </div>

              <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                តើអ្នកពិតជាចង់លុបស្លាយ "<strong>{slideToDelete.titleKhmer || slideToDelete.title}</strong>" នេះមែនទេ?
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSlideToDelete(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-neutral-700 text-xs font-semibold text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteSlide(slideToDelete.id)}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  លុបចេញ (Delete)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
