"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/cn";

const TABS = [
  {
    href: "/",
    label: "Home",
    icon: (active: boolean) => (
      <path
        d="M4 11.5 12 4l8 7.5M6 10v9h5v-5h2v5h5v-9"
        stroke="currentColor"
        strokeWidth={active ? 2.25 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    href: "/browse",
    label: "Browse",
    icon: (active: boolean) => (
      <>
        <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth={active ? 2.25 : 2} />
        <path d="M20 20l-4.35-4.35" stroke="currentColor" strokeWidth={active ? 2.25 : 2} strokeLinecap="round" />
      </>
    ),
  },
  {
    href: "/build-profile",
    label: "My Profile",
    icon: (active: boolean) => (
      <>
        <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth={active ? 2.25 : 2} />
        <path d="M4.5 20c1.2-3.8 4.3-6 7.5-6s6.3 2.2 7.5 6" stroke="currentColor" strokeWidth={active ? 2.25 : 2} strokeLinecap="round" />
      </>
    ),
  },
  {
    href: "/coaches",
    label: "Coaches",
    icon: (active: boolean) => (
      <>
        <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth={active ? 2.25 : 2} />
        <path d="M4 10h16M9 10v9" stroke="currentColor" strokeWidth={active ? 2.25 : 2} />
      </>
    ),
  },
  {
    href: "/leaderboard",
    label: "Ranks",
    icon: (active: boolean) => (
      <path
        d="M6 20v-6M12 20V8M18 20v-9"
        stroke="currentColor"
        strokeWidth={active ? 2.25 : 2}
        strokeLinecap="round"
      />
    ),
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { status } = useSession();
  const [starredCount, setStarredCount] = useState(0);

  useEffect(() => {
    if (status !== "authenticated") {
      setStarredCount(0);
      return;
    }
    fetch("/api/users/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => setStarredCount(user?.starredAthletes?.length ?? 0))
      .catch(() => {});
  }, [status]);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-navy-900/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      data-mobile-bottom-nav
    >
      <div className="grid grid-cols-5">
        {TABS.map((tab) => {
          const active =
            tab.href === "/" ? pathname === "/" : pathname?.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors",
                active ? "text-white" : "text-slate-500"
              )}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                {tab.icon(!!active)}
              </svg>
              {tab.label}
              {tab.href === "/coaches" && starredCount > 0 && (
                <span className="absolute right-[22%] top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-electric-500 px-1 text-[9px] font-bold text-white">
                  {starredCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
