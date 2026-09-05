import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * ⚠️ THIS ASKED FOR THE ORIGINAL UPLOAD, AND THE ORIGINALS ARE ENORMOUS.
 * The catalogue stores WordPress's 400x400 thumbnail. Stripping the size
 * suffix requests the untouched file straight off the camera: measured 10.19MB
 * for one product photo, against 0.09MB for the same image at 1024x1024 — a
 * hundred and thirteen times the bytes for a picture shown at about 600px, on
 * every product page and in the protocol drawer.
 *
 * 1024 is the largest variant WordPress generates here and is plenty for the
 * page and its zoom. Verified 2026-09-05: all 41 catalogue images that carry a
 * size suffix have a -1024x1024 variant (the other 6 have no suffix and are
 * returned untouched, as before).
 */
export function getHighResImageUrl(url: string): string {
  if (!url) return url;
  return url.replace(/-d+xd+(.w+)$/, '-1024x1024$1');
}

export function safeStringify(value: any): string {
  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
}
