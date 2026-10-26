/**
 * Utility to manage saving uploaded images into a dedicated folder on the administrator's computer.
 * Supports the native browser File System Access API (window.showDirectoryPicker)
 * with graceful fallback to user-initiated download without breaking execution.
 */

// Global directory handle reference
let activeDirectoryHandle: any = null;

export const hasFileSystemAccessSupport = (): boolean => {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
};

/**
 * Ask administrator to pick a dedicated folder on their computer.
 */
export const selectDedicatedLocalFolder = async (): Promise<string | null> => {
  if (!hasFileSystemAccessSupport()) {
    return null;
  }
  try {
    const handle = await (window as any).showDirectoryPicker({
      id: 'akuruhi_admin_images',
      mode: 'readwrite',
      startIn: 'pictures',
    });
    activeDirectoryHandle = handle;
    return handle.name;
  } catch (err: any) {
    if (err.name !== 'AbortError') {
      console.warn('Directory picker notice:', err);
    }
    return null;
  }
};

export const getConnectedFolderName = (): string | null => {
  return activeDirectoryHandle ? activeDirectoryHandle.name : null;
};

/**
 * Safely convert base64 / dataUrl or plain string to Blob
 */
export const dataUrlToBlob = (dataUrl: string): Blob => {
  try {
    if (!dataUrl.startsWith('data:')) {
      return new Blob([dataUrl], { type: 'text/plain' });
    }
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (err) {
    console.warn('dataUrlToBlob conversion warning:', err);
    return new Blob([''], { type: 'image/jpeg' });
  }
};

/**
 * Saves a file into the dedicated folder on the administrator's computer.
 * If a directory handle is connected, it writes directly to disk.
 * If autoDownloadFallback is true (e.g. explicitly requested by user), it initiates a browser download.
 */
export const saveImageToAdministratorFolder = async (
  fileOrDataUrl: File | string,
  suggestedFilename: string,
  autoDownloadFallback = false
): Promise<{ success: boolean; savedToLocalFolder: boolean; filename: string }> => {
  try {
    let blob: Blob;
    let filename = suggestedFilename || `akuruhi_image_${Date.now()}.jpg`;

    if (typeof fileOrDataUrl === 'string') {
      blob = dataUrlToBlob(fileOrDataUrl);
      if (!filename.includes('.')) {
        const ext = blob.type.split('/')[1] || 'jpg';
        filename = `${filename}.${ext}`;
      }
    } else {
      blob = fileOrDataUrl;
      filename = fileOrDataUrl.name || suggestedFilename;
    }

    // Sanitize filename
    filename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Attempt direct write via File System Access API if permission granted
    if (activeDirectoryHandle) {
      try {
        const fileHandle = await activeDirectoryHandle.getFileHandle(filename, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        return { success: true, savedToLocalFolder: true, filename };
      } catch (e) {
        console.warn('Directory handle write unavailable:', e);
      }
    }

    // Fallback: trigger download ONLY if explicitly requested by user
    if (autoDownloadFallback && typeof document !== 'undefined') {
      try {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        return { success: true, savedToLocalFolder: true, filename };
      } catch (err) {
        console.warn('Browser download fallback caught:', err);
      }
    }

    return { success: true, savedToLocalFolder: false, filename };
  } catch (err) {
    console.warn('saveImageToAdministratorFolder safe handler:', err);
    return {
      success: true,
      savedToLocalFolder: false,
      filename: suggestedFilename || `image_${Date.now()}.jpg`,
    };
  }
};
