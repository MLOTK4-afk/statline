"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/international", label: "Overview" },
  { href: "/international/athletes", label: "Athlete Directory" },
  { href: "/international/guides", label: "Guides" },
  { href: "/international/recruiting-board", label: "My Recruiting Board" },
];

export function IntlSubNav() {
  const pathname = usePathname();
  return (
    <div className="border-b border-white/10 bg-navy-950/40">
      <nav className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
        {LINKS.map((link) => {
          const active =
            link.href === "/international"
              ? pathname === "/international"
              : pathname?.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "shrink-0 text-sm font-medium transition-colors",
                active ? "text-intl-300" : "text-slate-400 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
