import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine class names with Tailwind-aware merge semantics.
 *
 * - clsx handles conditional / array / object class inputs
 * - twMerge deduplicates conflicting Tailwind utilities (e.g. `p-2 p-4` → `p-4`)
 *
 * This is the standard shadcn/ui `cn` helper. Every shadcn component relies on it.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
