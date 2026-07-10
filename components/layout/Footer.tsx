import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-navy-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <Logo withTagline height={32} />
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h3 className="font-heading text-sm tracking-wider text-slate-300">
                Platform
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="/build-profile" className="hover:text-white">
                    Build Profile
                  </Link>
                </li>
                <li>
                  <Link href="/browse" className="hover:text-white">
                    Browse Athletes
                  </Link>
                </li>
                <li>
                  <Link href="/leaderboard" className="hover:text-white">
                    Leaderboard
                  </Link>
                </li>
                <li>
                  <Link href="/coaches" className="hover:text-white">
                    Coaches
                  </Link>
                </li>
                <li>
                  <Link href="/athletes/example" className="hover:text-white">
                    Example Profile
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-heading text-sm tracking-wider text-slate-300">
                International
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="/international" className="hover:text-white">
                    Overview
                  </Link>
                </li>
                <li>
                  <Link href="/international/guides" className="hover:text-white">
                    Recruiting Guides
                  </Link>
                </li>
                <li>
                  <Link
                    href="/international/build-profile"
                    className="hover:text-white"
                  >
                    International Profile
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-heading text-sm tracking-wider text-slate-300">
                Account
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="/login" className="hover:text-white">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-white">
                    Create Account
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Statline. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm font-medium">
            <Link
              href="/privacy"
              className="text-electric-500 underline underline-offset-2 hover:text-electric-600"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-electric-500 underline underline-offset-2 hover:text-electric-600"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
