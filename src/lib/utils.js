export function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

/**
 * Resizes an uploaded image and re-encodes it as JPEG so covers stay small
 * (usually 40–120 KB) no matter how large the original photo is.
 */
export function compressImage(file, { maxWidth = 600, maxHeight = 900, quality = 0.85 } = {}) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.naturalWidth, maxHeight / img.naturalHeight);
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff'; // transparent PNGs get a white background
      ctx.fillRect(0, 0, w, h);
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('This image format could not be read. Try a JPG or PNG.'));
    };
    img.src = url;
  });
}

/** Stable number from a string, used to give placeholder covers their own colour. */
export function hashString(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function formatDate(ts) {
  return new Date(ts).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function pluralize(n, word) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

/** Numeric-aware compare so page "9" sorts before page "120". Empty pages go last. */
export function comparePages(a, b) {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return String(a).localeCompare(String(b), undefined, { numeric: true });
}

export function normalize(str = '') {
  return str.toLocaleLowerCase().trim();
}

export function isTypingTarget(el) {
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}
