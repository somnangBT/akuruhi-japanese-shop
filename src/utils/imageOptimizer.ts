/**
 * Client-side image compression and resizing utility.
 * Optimizes uploaded images to reasonable dimensions (max 1200x1200px, JPEG ~82% quality)
 * to prevent browser localStorage quota exhaustion and ensure ultra-fast catalog rendering.
 */

export interface OptimizedImageResult {
  dataUrl: string;
  sizeKb: number;
  width: number;
  height: number;
  format: string;
}

export const optimizeImageForWeb = async (
  fileOrDataUrl: File | string,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  } = {}
): Promise<OptimizedImageResult> => {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.82 } = options;

  // Handle PDF or non-image files safely
  if (fileOrDataUrl instanceof File) {
    if (fileOrDataUrl.type === 'application/pdf' || fileOrDataUrl.name.toLowerCase().endsWith('.pdf')) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const res = reader.result as string;
          resolve({
            dataUrl: res,
            sizeKb: Math.round(res.length / 1024),
            width: 0,
            height: 0,
            format: 'application/pdf',
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(fileOrDataUrl);
      });
    }
  }

  // 1. Convert input to data URL string
  let sourceDataUrl = '';
  if (typeof fileOrDataUrl === 'string') {
    sourceDataUrl = fileOrDataUrl;
  } else {
    sourceDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file from disk.'));
      reader.readAsDataURL(fileOrDataUrl);
    });
  }

  // If it's an SVG data URL, preserve vector quality without canvas rasterization
  if (sourceDataUrl.startsWith('data:image/svg') || sourceDataUrl.includes('<svg')) {
    return {
      dataUrl: sourceDataUrl,
      sizeKb: Math.round(sourceDataUrl.length / 1024),
      width: 400,
      height: 400,
      format: 'image/svg+xml',
    };
  }

  // 2. Load into HTML Image
  return new Promise<OptimizedImageResult>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width === 0 || height === 0) {
          // Fallback if dimensions cannot be determined
          resolve({
            dataUrl: sourceDataUrl,
            sizeKb: Math.round(sourceDataUrl.length / 1024),
            width: 800,
            height: 600,
            format: 'image/jpeg',
          });
          return;
        }

        // Calculate proportional scale down
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) {
          resolve({
            dataUrl: sourceDataUrl,
            sizeKb: Math.round(sourceDataUrl.length / 1024),
            width,
            height,
            format: 'image/jpeg',
          });
          return;
        }

        // Smooth image downscaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Detect if source is PNG, WebP or SVG to preserve transparency (vital for logos & badges)
        const isTransparentFormat =
          (fileOrDataUrl instanceof File &&
            (fileOrDataUrl.type.includes('png') ||
              fileOrDataUrl.type.includes('webp') ||
              fileOrDataUrl.type.includes('svg'))) ||
          sourceDataUrl.startsWith('data:image/png') ||
          sourceDataUrl.startsWith('data:image/webp') ||
          sourceDataUrl.startsWith('data:image/svg');

        const outputMime = isTransparentFormat ? 'image/png' : 'image/jpeg';
        let outputDataUrl = canvas.toDataURL(outputMime, isTransparentFormat ? undefined : quality);

        // If compressed version is somehow larger or failed, fallback to original
        if (!outputDataUrl || outputDataUrl === 'data:,' || (sourceDataUrl.length < outputDataUrl.length && sourceDataUrl.length < 500 * 1024)) {
          outputDataUrl = sourceDataUrl;
        }

        const sizeKb = Math.round((outputDataUrl.length * 3) / 4 / 1024);

        resolve({
          dataUrl: outputDataUrl,
          sizeKb,
          width,
          height,
          format: outputMime,
        });
      } catch (err) {
        console.warn('Canvas optimization warning, using original data URL:', err);
        resolve({
          dataUrl: sourceDataUrl,
          sizeKb: Math.round(sourceDataUrl.length / 1024),
          width: img.width || 800,
          height: img.height || 600,
          format: 'image/jpeg',
        });
      }
    };

    img.onerror = () => {
      // If image loading fails, resolve with source dataUrl rather than rejecting
      resolve({
        dataUrl: sourceDataUrl,
        sizeKb: Math.round(sourceDataUrl.length / 1024),
        width: 0,
        height: 0,
        format: 'image/jpeg',
      });
    };

    img.src = sourceDataUrl;
  });
};
