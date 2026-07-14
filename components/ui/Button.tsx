import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "accent"
  | "outlineAccent"
  | "flare";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "btn-glow text-white",
  secondary:
    "bg-white text-navy-900 hover:bg-skyline-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]",
  outline:
    "border border-skyline-300/40 text-white hover:border-skyline-300 hover:bg-white/5 hover:shadow-[0_0_20px_rgba(147,197,253,0.3)]",
  ghost:
    "text-skyline-300 hover:text-white hover:bg-white/5 hover:shadow-[0_0_16px_rgba(59,130,246,0.2)]",
  // International section's brand accent — green instead of electric blue.
  accent:
    "bg-intl-500 text-white shadow-lg shadow-intl-500/20 hover:bg-intl-600 hover:shadow-[0_0_24px_rgba(16,185,129,0.45)]",
  outlineAccent:
    "border border-intl-300/40 text-white hover:border-intl-300 hover:bg-white/5 hover:shadow-[0_0_20px_rgba(110,231,183,0.3)]",
  // Tertiary violet->pink accent -- reserved for a couple of deliberate
  // spots (e.g. the persistent nav CTA), not a replacement for primary.
  flare: "btn-glow-flare text-white",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold tracking-wide transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: CommonProps & { href: string }) {
  return (
    <Link
      href={href}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {children}
    </Link>
  );
}
