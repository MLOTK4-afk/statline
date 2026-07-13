"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Logo } from "./Logo";
import { GlobalSearch } from "./GlobalSearch";
import { Button, LinkButton } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const NAV_LINKS = [
  { href: "/browse", label: "Browse" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/international", label: "International" },
  { href: "/coaches", label: "Coaches" },
];

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-900/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Logo height={36} className="shrink-0" />

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium text-slate-300 transition-colors hover:text-white",
                pathname?.startsWith(link.href) && "text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
          {session?.user?.role === "admin" && (
            <Link
              href="/admin"
              className={cn(
                "text-sm font-medium text-slate-300 transition-colors hover:text-white",
                pathname?.startsWith("/admin") && "text-white"
              )}
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <GlobalSearch />
          <Link
            href="/athletes/example"
            className="text-sm text-slate-500 underline decoration-dotted underline-offset-4 transition-colors hover:text-slate-300"
          >
            See an example profile
          </Link>
          {status === "authenticated" ? (
            <>
              <span className="text-sm text-slate-400">
                {session.user?.name}
              </span>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <LinkButton href="/login" variant="ghost" size="sm">
                Sign In
              </LinkButton>
              <LinkButton href="/build-profile" variant="flare" size="sm">
                Build Profile
              </LinkButton>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <GlobalSearch />
          <button
            className="flex items-center justify-center rounded-md p-2 text-white"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-navy-900 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-slate-300 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            {session?.user?.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-slate-300 hover:text-white"
              >
                Admin
              </Link>
            )}
            <Link
              href="/athletes/example"
              onClick={() => setOpen(false)}
              className="text-sm text-slate-500 underline decoration-dotted underline-offset-4 hover:text-slate-300"
            >
              See an example profile
            </Link>
            <div className="flex flex-col gap-2 pt-2">
              {status === "authenticated" ? (
                <Button variant="outline" size="sm" onClick={() => signOut()}>
                  Sign Out
                </Button>
              ) : (
                <>
                  <LinkButton href="/login" variant="outline" size="sm">
                    Sign In
                  </LinkButton>
                  <LinkButton href="/build-profile" variant="primary" size="sm">
                    Build Profile
                  </LinkButton>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
