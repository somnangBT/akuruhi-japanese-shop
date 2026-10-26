import React, { useState } from 'react';
import {
  ShieldCheck,
  Edit3,
  Award,
  Snowflake,
  CheckCircle2,
  MapPin,
  Phone,
  Clock,
  Sparkles,
  Quote,
  Building,
  Upload,
  X,
  Save,
  Compass,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { AboutMeData } from '../types';

export const AboutMeSection: React.FC = () => {
  const { settings, updateAboutMe, currentUser, saveUploadedImage, showToast } = useStore();
  const aboutMe = settings.aboutMe;
  const isAdmin = currentUser?.role === 'admin';

  // Editor Modal State (Admin only)
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [formData, setFormData] = useState<AboutMeData>(aboutMe);

  const handleOpenEditor = () => {
    setFormData(settings.aboutMe);
    setIsEditorOpen(true);
  };

  const handleSaveEditor = (e: React.FormEvent) => {
    e.preventDefault();
    updateAboutMe(formData);
    setIsEditorOpen(false);
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const { url } = await saveUploadedImage(file, 'about_me', `about_banner_${Date.now()}`);
        setFormData((prev) => ({ ...prev, bannerImageUrl: url }));
        showToast('About Me banner uploaded successfully.');
      } catch (err: any) {
        showToast(err?.message || 'Banner upload failed.');
      } finally {
        e.target.value = '';
      }
    }
  };

  const handleFounderPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const { url } = await saveUploadedImage(file, 'about_me', `founder_photo_${Date.now()}`);
        setFormData((prev) => ({ ...prev, founderImageUrl: url }));
        showToast('Director photo uploaded successfully.');
      } catch (err: any) {
        showToast(err?.message || 'Photo upload failed.');
      } finally {
        e.target.value = '';
      }
    }
  };

  return (
    <div className="relative py-14 sm:py-20 bg-slate-50 dark:bg-[#0d0f14] text-slate-850 dark:text-neutral-100 overflow-hidden transition-colors">
      {/* Background Japanese pattern accents */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#e11d48_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Top Header & Admin Edit Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-neutral-850 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>About Akuruhi Cambodia · Japanese Culinary Heritage</span>
            </div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 dark:text-white tracking-tight leading-tight">
              {aboutMe.heroTitle}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-neutral-400 max-w-3xl mt-3 leading-relaxed">
              {aboutMe.heroSubtitle}
            </p>
          </div>

          {/* Admin Authority Edit Button (Only visible to authenticated administrators) */}
          {isAdmin && (
            <div className="shrink-0 flex items-center gap-3">
              <button
                onClick={handleOpenEditor}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 transition-all text-xs font-semibold shadow-sm"
              >
                <Edit3 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Edit About Me Section</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-[10px] uppercase font-bold text-amber-800 dark:text-amber-200">
                  Admin Authority
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Hero Visual & Founder Quote Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Main Visual Image Banner */}
          <div className="lg:col-span-7 relative rounded-3xl overflow-hidden border border-slate-200 dark:border-neutral-800 bg-neutral-900 min-h-[360px] sm:min-h-[420px] shadow-xl dark:shadow-2xl flex flex-col justify-end p-6 sm:p-10">
            {aboutMe.bannerImageUrl && (
              <img
                src={aboutMe.bannerImageUrl}
                alt="Akuruhi Japanese Food Facility"
                className="absolute inset-0 w-full h-full object-cover object-center filter brightness-65 transition-transform duration-700 hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-xs text-neutral-300">
                <Award className="w-3.5 h-3.5 text-rose-500" />
                <span>Established in {aboutMe.establishedYear} · 28+ Years of Service</span>
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
                Direct Tokyo Air Freight & Wholesale Cold Storage
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xl">
                Serving top sushi omakase bars, izakayas, luxury five-star hotels, and Japanese expats living in Phnom Penh.
              </p>
            </div>
          </div>

          {/* Founder & Director Statement Card */}
          <div className="lg:col-span-5 rounded-3xl bg-white dark:bg-[#12151d] border border-slate-200 dark:border-neutral-800 p-6 sm:p-8 flex flex-col justify-between shadow-lg dark:shadow-2xl relative overflow-hidden">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-neutral-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-600/10 border border-rose-500/30 text-rose-500 flex items-center justify-center font-display font-extrabold text-xl">
                    旭
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">{aboutMe.founderName}</h3>
                    <p className="text-xs text-slate-500 dark:text-neutral-400">{aboutMe.founderTitle}</p>
                  </div>
                </div>
                <Quote className="w-7 h-7 text-slate-300 dark:text-neutral-700 shrink-0" />
              </div>

              <div className="relative">
                <p className="text-sm sm:text-base text-slate-700 dark:text-neutral-200 italic leading-relaxed">
                  "{aboutMe.founderQuote}"
                </p>
              </div>

              {/* Key Mission & Vision */}
              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-900/80 border border-slate-200 dark:border-neutral-800/80 space-y-1">
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-xs uppercase tracking-wider">
                    <Compass className="w-3.5 h-3.5" />
                    <span>Our Core Mission</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">{aboutMe.mission}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-900/80 border border-slate-200 dark:border-neutral-800/80 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Our Vision</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">{aboutMe.vision}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-neutral-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-neutral-400">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="truncate max-w-[200px] text-slate-700 dark:text-neutral-300">{aboutMe.headquarters}</span>
              </div>
              <span className="text-slate-400 dark:text-neutral-500 font-mono">Verified {aboutMe.lastUpdated}</span>
            </div>
          </div>
        </div>

        {/* Company Story Detail & Cold Chain Assurance */}
        <div className="rounded-3xl bg-white dark:bg-[#11141b] border border-slate-200 dark:border-neutral-800 p-8 sm:p-12 space-y-8 shadow-lg dark:shadow-xl">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold text-rose-600 dark:text-rose-500 uppercase tracking-widest">
              Brand History & Craftsmanship
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
              {aboutMe.storyHeadline}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-600 dark:text-neutral-300 leading-relaxed">
            {aboutMe.storyParagraphs.map((para, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-800/60 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 font-mono font-bold text-xs flex items-center justify-center">
                    0{idx + 1}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-300 leading-relaxed">{para}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Facility Highlights Checklist */}
          <div className="pt-4 border-t border-slate-200 dark:border-neutral-800/80">
            <h3 className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-4">
              Cold Chain & Quality Assurance Highlights
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {aboutMe.facilityHighlights.map((hl, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-neutral-900/80 border border-slate-200 dark:border-neutral-800 text-xs text-slate-700 dark:text-neutral-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{hl}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Showrooms & Wholesale Distribution Centers */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white">
                Showrooms & Cold Dispatch Centers
              </h2>
              <p className="text-xs text-slate-600 dark:text-neutral-400 mt-1">
                Visit our physical showroom in Phnom Penh or arrange cold van delivery for your venue.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aboutMe.showrooms.map((showroom, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-[#11141c] border border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 transition-colors space-y-4 shadow-md dark:shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">{showroom.name}</h3>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Open & Dispatching Daily</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-neutral-300 pt-2 border-t border-slate-200 dark:border-neutral-800/80">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 dark:text-neutral-500 shrink-0" />
                    <span>{showroom.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 dark:text-neutral-500 shrink-0" />
                    <span>{showroom.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 dark:text-neutral-500 shrink-0" />
                    <span>{showroom.hours}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Authority Edit Modal */}
      {isEditorOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white dark:bg-[#11141c] text-slate-900 dark:text-neutral-100 rounded-2xl border border-slate-200 dark:border-neutral-750 shadow-2xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                    Edit "About Me" & Company Information
                  </h2>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Administrator Authority Mode · Only you can edit this content
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditor} className="space-y-5 text-xs">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-neutral-200">Main Title & Subtitle</h3>
                <div>
                  <label className="block text-slate-700 dark:text-neutral-400 mb-1">Headline Title</label>
                  <input
                    type="text"
                    value={formData.heroTitle}
                    onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-neutral-400 mb-1">Subtitle</label>
                  <textarea
                    rows={2}
                    value={formData.heroSubtitle}
                    onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
              </div>

              {/* Founder Information */}
              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-neutral-850">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-neutral-200">Director / Founder Statement</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-neutral-400 mb-1">Director Name</label>
                    <input
                      type="text"
                      value={formData.founderName}
                      onChange={(e) => setFormData({ ...formData, founderName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-neutral-400 mb-1">Title / Designation</label>
                    <input
                      type="text"
                      value={formData.founderTitle}
                      onChange={(e) => setFormData({ ...formData, founderTitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-neutral-400 mb-1">Director Quote / Message</label>
                  <textarea
                    rows={3}
                    value={formData.founderQuote}
                    onChange={(e) => setFormData({ ...formData, founderQuote: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
              </div>

              {/* Mission & Vision */}
              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-neutral-850">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-neutral-200">Mission & Vision</h3>
                <div>
                  <label className="block text-slate-700 dark:text-neutral-400 mb-1">Core Mission</label>
                  <textarea
                    rows={2}
                    value={formData.mission}
                    onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-neutral-400 mb-1">Vision</label>
                  <textarea
                    rows={2}
                    value={formData.vision}
                    onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
              </div>

              {/* Story Paragraphs */}
              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-neutral-850">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-neutral-200">Company Story</h3>
                <div>
                  <label className="block text-slate-700 dark:text-neutral-400 mb-1">Story Headline</label>
                  <input
                    type="text"
                    value={formData.storyHeadline}
                    onChange={(e) => setFormData({ ...formData, storyHeadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
                {formData.storyParagraphs.map((para, i) => (
                  <div key={i}>
                    <label className="block text-slate-700 dark:text-neutral-400 mb-1">Paragraph {i + 1}</label>
                    <textarea
                      rows={3}
                      value={para}
                      onChange={(e) => {
                        const updated = [...formData.storyParagraphs];
                        updated[i] = e.target.value;
                        setFormData({ ...formData, storyParagraphs: updated });
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                      required
                    />
                  </div>
                ))}
              </div>

              {/* Image Upload for About Me */}
              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-neutral-850">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-neutral-200">
                  Upload Visual Banner (Saved to Dedicated Folder on Your Computer)
                </h3>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-neutral-850 hover:bg-slate-200 dark:hover:bg-neutral-800 border border-slate-300 dark:border-neutral-700 text-slate-800 dark:text-neutral-200 cursor-pointer text-xs font-medium">
                    <Upload className="w-4 h-4 text-rose-500" />
                    <span>Upload Banner Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      className="hidden"
                    />
                  </label>
                  {formData.bannerImageUrl && (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">✓ Image loaded & synced</span>
                  )}
                </div>
              </div>

              {/* Save & Cancel */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-neutral-800 hover:bg-slate-300 dark:hover:bg-neutral-750 text-slate-800 dark:text-neutral-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-lg shadow-rose-950"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
