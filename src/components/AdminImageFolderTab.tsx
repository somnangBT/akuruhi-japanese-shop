import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  Download,
  Image as ImageIcon,
  CheckCircle,
  HardDrive,
  Trash2,
  RefreshCw,
  ExternalLink,
  UploadCloud,
  FileCheck,
  Search,
  Plus,
  Upload,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { saveImageToAdministratorFolder } from '../utils/localFolderSync';
import { UploadedImageRecord } from '../types';

export const AdminImageFolderTab: React.FC = () => {
  const {
    uploadedImages,
    deleteUploadedImage,
    clearAllUploadedImages,
    saveUploadedImage,
    settings,
    connectedLocalFolder,
    connectDedicatedLocalFolder,
    showToast,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [targetFilter, setTargetFilter] = useState<'all' | string>('all');
  const [uploadCategory, setUploadCategory] = useState<'product' | 'logo' | 'background' | 'qr_code' | 'about_me'>('product');
  const [isExporting, setIsExporting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Deletion modals state
  const [imageToDelete, setImageToDelete] = useState<UploadedImageRecord | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);

  const folderName = connectedLocalFolder || settings.dedicatedImageFolder || 'Akuruhi_Admin_Uploads';

  const filteredImages = uploadedImages.filter((img) => {
    if (targetFilter !== 'all' && img.target !== targetFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return img.name.toLowerCase().includes(q) || img.filename.toLowerCase().includes(q);
    }
    return true;
  });

  const handleConnectFolder = async () => {
    await connectDedicatedLocalFolder();
  };

  const handleDownloadSingle = async (img: typeof uploadedImages[0]) => {
    const res = await saveImageToAdministratorFolder(img.url, img.filename, true);
    if (res.savedToLocalFolder) {
      showToast(`Saved "${img.filename}" directly into your local folder "${folderName}".`);
    } else {
      showToast(`Downloaded "${img.filename}" to your computer.`);
    }
  };

  const handleDownloadAllToFolder = async () => {
    if (uploadedImages.length === 0) {
      showToast('No images uploaded to export yet.');
      return;
    }
    setIsExporting(true);
    let count = 0;
    for (const img of uploadedImages) {
      try {
        await saveImageToAdministratorFolder(img.url, img.filename, true);
        count++;
        // short delay to prevent browser download throttling
        await new Promise((r) => setTimeout(r, 200));
      } catch (err) {
        console.warn('Export single error:', err);
      }
    }
    setIsExporting(false);
    showToast(`Successfully saved ${count} image(s) to dedicated folder "${folderName}" on your computer.`);
  };

  const handleDirectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    let successCount = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        await saveUploadedImage(file, uploadCategory, file.name);
        successCount++;
      } catch (err: any) {
        console.warn('Direct upload warning:', err);
      }
    }
    setIsUploading(false);
    e.target.value = '';

    if (successCount > 0) {
      showToast(`Successfully uploaded ${successCount} image(s) to storage repository.`);
    } else {
      showToast('Failed to upload image. Please try another file.');
    }
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-neutral-100">
      {/* Top Banner: Dedicated Local Folder Configuration */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gradient-to-r dark:from-[#141824] dark:to-[#12151e] border border-slate-200 dark:border-neutral-750 shadow-sm dark:shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-500 dark:text-sky-400 flex items-center justify-center shrink-0">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  Dedicated Administrator Image Storage
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Repository Active</span>
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-neutral-400 mt-1 max-w-xl">
                Upload and organize product photos, logos, backgrounds, and QR codes. Images are optimized automatically for ultra-fast loading and can be downloaded or synced directly to your computer folder.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Upload directly to repository */}
            <label className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-semibold shadow-md transition-colors cursor-pointer ${
              isUploading
                ? 'bg-slate-200 dark:bg-neutral-800 border-slate-300 dark:border-neutral-700 text-slate-500 dark:text-neutral-400 cursor-not-allowed'
                : 'bg-rose-600 hover:bg-rose-500 border-rose-500/40 text-white'
            }`}>
              <Upload className="w-4 h-4" />
              <span>{isUploading ? 'Optimizing & Uploading...' : 'Upload Image'}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={isUploading}
                onChange={handleDirectImageUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={handleConnectFolder}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-slate-800 dark:text-white text-xs font-semibold border border-slate-300 dark:border-neutral-700 transition-colors shadow-xs"
            >
              <HardDrive className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              <span>Choose Computer Folder</span>
            </button>

            <button
              onClick={handleDownloadAllToFolder}
              disabled={isExporting || uploadedImages.length === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-sky-950 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Saving to Computer...' : 'Download All to Folder'}</span>
            </button>

            {uploadedImages.length > 0 && (
              <button
                onClick={() => setShowClearAllModal(true)}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-red-100 hover:bg-red-200 border border-red-300 text-red-800 dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:border-red-800/60 dark:text-red-300 text-xs font-semibold transition-colors shadow-xs"
                title="Clear all image sync records"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All Syncs</span>
              </button>
            )}
          </div>
        </div>

        {/* Path Indicator and Target Category Picker */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-neutral-950/80 border border-slate-200 dark:border-neutral-800 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-slate-500 dark:text-neutral-500 font-mono">Assigned Local Folder:</span>
            <span className="font-mono font-bold text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/50 border border-sky-300 dark:border-sky-800/60">
              📁 {folderName}
            </span>
            <span className="text-slate-300 dark:text-neutral-600">·</span>
            <span className="text-slate-600 dark:text-neutral-400">
              {uploadedImages.length} image files stored
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-neutral-500 text-[11px]">Upload Tag:</span>
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value as any)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-750 text-slate-800 dark:text-white text-xs focus:outline-none"
            >
              <option value="product">Product Photo</option>
              <option value="logo">Store Logo</option>
              <option value="background">Background Image</option>
              <option value="qr_code">Payment KHQR</option>
              <option value="about_me">About Me Story</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 dark:text-neutral-500" />
            <input
              type="text"
              placeholder="Search uploaded images by filename..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-sky-500"
            />
          </div>

          <select
            value={targetFilter}
            onChange={(e) => setTargetFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white text-xs focus:outline-none"
          >
            <option value="all">All Upload Categories</option>
            <option value="product">Product Images</option>
            <option value="logo">Brand Logos</option>
            <option value="background">Backgrounds</option>
            <option value="qr_code">Payment QR Codes</option>
            <option value="about_me">About Me Visuals</option>
            <option value="quotation">Quotation Documents</option>
          </select>
        </div>
      </div>

      {/* Image Gallery Grid */}
      {filteredImages.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white dark:bg-neutral-900/40 border border-slate-200 dark:border-neutral-800 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-neutral-800 text-slate-400 dark:text-neutral-500 flex items-center justify-center mx-auto">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-slate-900 dark:text-white text-sm">No Images in Repository Yet</h3>
            <p className="text-xs text-slate-600 dark:text-neutral-400 max-w-sm mx-auto mt-1">
              Upload product images, store logos, or payment QR codes. They will appear here with automatic optimization.
            </p>
          </div>
          <div>
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer shadow-md transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload First Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleDirectImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredImages.map((img) => (
            <div
              key={img.id}
              className="rounded-2xl bg-white dark:bg-[#11141c] border border-slate-200 dark:border-neutral-800 overflow-hidden shadow-sm dark:shadow-lg flex flex-col justify-between group hover:border-slate-300 dark:hover:border-neutral-700 transition-colors"
            >
              {/* Image Preview Container */}
              <div className="relative aspect-video bg-slate-100 dark:bg-neutral-950 overflow-hidden flex items-center justify-center">
                <img
                  src={img.url}
                  alt={img.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-[10px] font-mono text-white uppercase tracking-wider">
                  {img.target.replace('_', ' ')}
                </div>
              </div>

              {/* Meta & Actions */}
              <div className="p-3.5 space-y-2.5">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-xs truncate" title={img.name}>
                    {img.name}
                  </h4>
                  <p className="font-mono text-[11px] text-slate-500 dark:text-neutral-400 truncate mt-0.5">
                    {img.filename}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-neutral-500 font-mono">
                  <span>{img.sizeKb} KB</span>
                  <span>{new Date(img.uploadedAt).toLocaleDateString()}</span>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-neutral-850 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleDownloadSingle(img)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 text-xs font-medium transition-colors"
                    title={`Save to ${folderName}`}
                  >
                    <Download className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                    <span>Save to Folder</span>
                  </button>

                  <button
                    onClick={() => setImageToDelete(img)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 dark:bg-neutral-800 dark:hover:bg-rose-950/80 dark:text-neutral-400 dark:hover:text-rose-400 transition-colors"
                    title="Delete image sync record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- SINGLE IMAGE DELETE CONFIRMATION MODAL --- */}
      {imageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-[#11141c] text-slate-900 dark:text-neutral-100 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-100 border border-red-200 text-red-600 dark:bg-red-950/80 dark:border-red-800/60 dark:text-red-400 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                    Delete Image Sync
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                    Administrator repository management
                  </span>
                </div>
              </div>
              <button
                onClick={() => setImageToDelete(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
              Are you sure you want to delete this image record from the synchronized repository?
            </p>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
              <div className="w-14 h-14 rounded-lg bg-slate-200 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-800 overflow-hidden shrink-0">
                <img
                  src={imageToDelete.url}
                  alt={imageToDelete.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-xs text-slate-900 dark:text-white truncate" title={imageToDelete.name}>
                  {imageToDelete.name}
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-neutral-400 truncate mt-0.5">
                  {imageToDelete.filename}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-neutral-500 font-mono mt-1">
                  <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-neutral-800 uppercase">{imageToDelete.target}</span>
                  <span>{imageToDelete.sizeKb} KB</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setImageToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-neutral-850 hover:bg-slate-300 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteUploadedImage(imageToDelete.id);
                  setImageToDelete(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md shadow-red-950 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Record</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CLEAR ALL IMAGES CONFIRMATION MODAL --- */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-[#11141c] text-slate-900 dark:text-neutral-100 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-100 border border-red-200 text-red-600 dark:bg-red-950/80 dark:border-red-800/60 dark:text-red-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                    Clear All Image Syncs
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                    Bulk repository cleanup
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowClearAllModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
              Are you sure you want to clear all <strong className="text-slate-900 dark:text-white">{uploadedImages.length}</strong> image sync records from the administrator storage repository?
            </p>

            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 dark:bg-red-950/30 dark:border-red-900/40 dark:text-red-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>
                This will remove the uploaded image index records. Existing catalog products that already use these images will retain their linked image URL.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setShowClearAllModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-neutral-850 hover:bg-slate-300 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAllUploadedImages();
                  setShowClearAllModal(false);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md shadow-red-950 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Records</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
