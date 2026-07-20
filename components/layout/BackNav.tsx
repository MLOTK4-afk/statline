"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * A persistent "back" affordance under the navbar, present on every page --
 * most sites give users a way back to where they came from beyond the
 * browser's own back button, and this app didn't have one anywhere.
 *
 * Rendered once in the root layout (like BackToTop/MobileBottomNav) rather
 * than per-page, so it's automatically on every route with no per-page
 * wiring. Lives in normal document flow (not fixed) so it can never
 * overlap a page's own hero/banner content -- it just adds a slim strip
 * under the navbar everywhere.
 *
 * Only shown once the user has actually navigated somewhere *within this
 * session* -- calling router.back() on the very first page you land on
 * (a bookmark, a shared link, a fresh tab) would either do nothing or
 * leave the site entirely, which is worse than no button at all. Root
 * layout components persist across client-side navigations in the App
 * Router (same instance as BackToTop relies on), so this counter survives
 * route changes without extra plumbing.
 */
export function BackNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);
  const lastPathname = useRef<string | null>(null);
  const visitedCount = useRef(0);

  useEffect(() => {
    if (lastPathname.current === pathname) return;
    lastPathname.current = pathname;
    visitedCount.current += 1;
    if (visitedCount.current > 1) setCanGoBack(true);
  }, [pathname]);

  if (!canGoBack) return null;

  return (
    <div className="border-b border-white/5 bg-navy-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M19 12H5M11 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </button>
      </div>
    </div>
  );
}
