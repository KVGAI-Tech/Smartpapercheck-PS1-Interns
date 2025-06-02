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
