import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names with Tailwind CSS conflict resolution
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats price in Bangladeshi Taka
 * @param amount - Price amount
 * @returns Formatted price string
 */
export function formatPrice(amount: number): string {
  if (amount >= 100000) {
    return `৳${(amount / 100000).toFixed(2)} Lac`;
  }
  return `৳${amount.toLocaleString("en-BD")}`;
}

/**
 * Formats number with K/M suffix
 * @param num - Number to format
 * @returns Formatted string
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Generates a URL-safe slug from a string
 * @param text - Text to slugify
 * @returns URL-safe slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Truncates text to specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

/**
 * Debounce function for performance optimization
 * @param fn - Function to debounce
 * @param ms - Debounce delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Safe JSON parse with fallback
 * @param json - JSON string to parse
 * @param fallback - Fallback value on parse failure
 * @returns Parsed value or fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Generates a random ID
 * @param length - ID length
 * @returns Random alphanumeric ID
 */
export function generateId(length: number = 12): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const cryptoRandom = new Uint8Array(length);
  crypto.getRandomValues(cryptoRandom);
  for (let i = 0; i < length; i++) {
    result += chars[cryptoRandom[i] % chars.length];
  }
  return result;
}

/**
 * Validates email format
 * @param email - Email to validate
 * @returns True if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates Bangladeshi phone number
 * @param phone - Phone number to validate
 * @returns True if valid BD phone number
 */
export function isValidBDPhone(phone: string): boolean {
  // Matches +880XXXXXXXXXX or 01XXXXXXXXX
  const phoneRegex = /^(\+880|880|0)1[3-9]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s|-/g, ""));
}

/**
 * Calculates EMI for bike purchase
 * @param principal - Loan amount
 * @param rate - Annual interest rate (percentage)
 * @param months - Loan tenure in months
 * @returns Monthly EMI amount
 */
export function calculateEMI(
  principal: number,
  rate: number,
  months: number
): number {
  const monthlyRate = rate / 12 / 100;
  if (monthlyRate === 0) return principal / months;
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);
  return Math.round(emi);
}

/**
 * Formats relative time (e.g., "2 hours ago")
 * @param date - Date to format
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 30) {
    return then.toLocaleDateString("en-BD");
  }
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  }
  if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  }
  if (diffMins > 0) {
    return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  }
  return "Just now";
}
