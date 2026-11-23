import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { fr } from "@/i18n/fr";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function relativeTime(value: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60_000));
  if (minutes < 1) return fr.time.now;
  if (minutes < 60) return `${fr.time.ago} ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${fr.time.ago} ${hours} h`;
  return `${fr.time.ago} ${Math.floor(hours / 24)} j`;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(new Date(value));
}
