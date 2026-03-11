import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, format: "short" | "long" | "relative" = "short"): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  if (format === "relative") {
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "A l'instant";
    if (minutes < 60) return `Il y a ${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `Il y a ${days}j`;
    if (days < 30) return `Il y a ${Math.floor(days / 7)} sem.`;
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  }

  if (format === "long") {
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}
