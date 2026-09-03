import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getHighResImageUrl(url: string): string {
  if (!url) return url;
  return url.replace(/-\d+x\d+(\.\w+)$/, '$1');
}

export function safeStringify(value: any): string {
  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
}
