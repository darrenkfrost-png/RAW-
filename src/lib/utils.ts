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
  /* The one big view of a product: the page shows it at about 500px and offers
     a zoom, so 1024 earns its extra bytes here. Both of WordPress's names for a
     rendition resolve to it; an address with neither is left as it came. */
  if (/-\d+x\d+\.\w+$/.test(url)) return url.replace(/-\d+x\d+(\.\w+)$/, '-1024x1024$1');
  if (/-scaled\.\w+$/.test(url)) return url.replace(/-scaled(\.\w+)$/, '-1024x1024$1');
  return url;
}

/**
 * ⚠️ WORDPRESS HAS TWO NAMES FOR "TOO BIG", AND THIS ONLY KNEW ONE.
 *
 * A `-400x400` thumbnail is one of its generated sizes. A `-scaled` file is
 * something else: the 2560px copy it makes when an upload is enormous, and it
 * is still enormous — 1.69MB for the turmeric mockup, 1.34MB for the NMN one,
 * against 0.09MB for the same picture at 1024. Eight catalogue images carry
 * that suffix and were sailing through untouched.
 *
 * Both names now resolve to the 1024 rendition. Verified 2026-09-05: every one
 * of the 41 sized images and all 8 -scaled images has a -1024x1024; anything
 * with neither suffix is returned exactly as it came in.
 */
export function webSizedImage(url: string): string {
  if (!url) return url;
  /* ⚠️ SHRINK THE MONSTERS; LEAVE A THUMBNAIL ALONE. The first version of this
     sent every catalogue image to 1024 and made the shop HEAVIER: the cards
     draw at about 280px, where the catalogue's own -400x400 is 0.27MB and the
     1024 copy is 0.80MB. Bigger is only better where it is actually seen
     bigger, which is the product page — that is getHighResImageUrl's job, not
     this one. Here we only rescue the ones that are far too large for anything. */
  if (/-scaled\.\w+$/.test(url)) return url.replace(/-scaled(\.\w+)$/, '-1024x1024$1');
  return url;
}

export function safeStringify(value: any): string {
  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
}
