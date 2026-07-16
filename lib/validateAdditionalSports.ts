import type { SportEntry } from "@/lib/types";

/**
 * Enforces the 3-sport cap (1 primary + up to 2 additional) and that every
 * additional sport entry names a sport. Shared by the POST and PATCH athlete
 * routes so the cap can't be bypassed by editing an existing profile.
 * Returns an error message, or null if `value` is valid (or absent).
 */
export function validateAdditionalSports(value: unknown): string | null {
  if (value === undefined) return null;
  if (!Array.isArray(value)) return "additionalSports must be an array.";
  if (value.length > 2) {
    return "A profile can have at most 3 sports total (1 primary + 2 additional).";
  }
  for (const entry of value as SportEntry[]) {
    if (!entry || typeof entry.sport !== "string" || !entry.sport.trim()) {
      return "Each additional sport must have a sport name.";
    }
  }
  return null;
}
