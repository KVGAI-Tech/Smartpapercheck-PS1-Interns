import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getSafeImageUrl = (url) => {
  if (!url) return null;

  if (
    url.startsWith("data:") ||
    url.startsWith("blob:") ||
    url.startsWith("/api/placeholder")
  ) {
    return url;
  }

  if (url.toLowerCase().endsWith(".pdf")) {
    return "/api/placeholder/800/1200";
  }

  if (url.includes("?")) {
    return url;
  } else {
    return url;
  }
};

/**
 * Strip HTML tags and decode common entities to produce clean plain text.
 */
export const htmlToPlainText = (html = '') => {
  if (!html || typeof html !== 'string') return '';
  return html
      // Replace block-level tags with newlines so sub-parts on separate lines stay separate
      .replace(/<\/?(p|div|br|li|tr|h[1-6])[^>]*>/gi, '\n')
      // Strip all remaining tags
      .replace(/<[^>]+>/g, '')
      // Decode common HTML entities
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&[a-z]+;/gi, ' ')
      // Collapse runs of whitespace / blank lines
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
};
