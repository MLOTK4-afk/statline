"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";

export function PhotoHeader({
  eyebrow,
  title,
  subtitle,
  photoUrl,
  photoPosition = "center",
  accent = "blue",
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  photoUrl: string;
  photoPosition?: string;
  accent?: "blue" | "green";
  children?: ReactNode;
}) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      gsap.from(".photo-header-item", {
        autoAlpha: 0,
        y: reduceMotion ? 0 : 16,
        duration: reduceMotion ? 0 : 0.7,
        stagger: reduceMotion ? 0 : 0.1,
        ease: "power3.out",
      });
    },
    { scope: sectionRef }
  );

  const style = {
    "--photo-url": `url(${photoUrl})`,
    "--photo-position": photoPosition,
    ...(accent === "green"
      ? {
          "--photo-tint-1":
            "linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, transparent 45%)",
          "--photo-tint-2":
            "linear-gradient(-45deg, rgba(110, 231, 183, 0.08) 0%, transparent 40%)",
        }
      : {}),
  } as CSSProperties;

  return (
    <section
      ref={sectionRef}
      style={style}
      className="photo-bg angular-bg relative overflow-hidden border-b border-white/10 px-4 py-16 sm:py-20"
    >
      <div className="relative mx-auto max-w-4xl text-center">
        {eyebrow && (
          <p
            className={cn(
              "photo-header-item font-heading text-sm uppercase tracking-[0.3em]",
              accent === "green" ? "text-intl-300" : "text-skyline-300"
            )}
          >
            {eyebrow}
          </p>
        )}
        <h1 className="photo-header-item mt-3 text-4xl text-white sm:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="photo-header-item mx-auto mt-4 max-w-xl text-lg text-slate-400">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
