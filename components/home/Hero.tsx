"use client";

import { Suspense, useRef } from "react";
import { Logo } from "@/components/layout/Logo";
import { HeroCTAs } from "@/components/home/HeroCTAs";
import { HeroStats } from "@/components/home/HeroStats";
import { gsap, useGSAP } from "@/lib/gsap";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const tl = gsap.timeline({
        defaults: { ease: "power3.out", duration: reduceMotion ? 0 : 0.9 },
      });

      tl.from(".hero-logo", { autoAlpha: 0, y: 16, duration: reduceMotion ? 0 : 0.7 })
        .from(".hero-live-pill", { autoAlpha: 0, y: 10 }, "-=0.4")
        .from(".hero-tagline", { autoAlpha: 0, y: 10 }, "-=0.35")
        .from(
          ".hero-line",
          { autoAlpha: 0, y: 28, stagger: reduceMotion ? 0 : 0.12 },
          "-=0.45"
        )
        .from(".hero-copy", { autoAlpha: 0, y: 10 }, "-=0.5")
        .from(".hero-stats", { autoAlpha: 0, y: 10 }, "-=0.5")
        .from("#build-profile-section", { autoAlpha: 0, y: 12 }, "-=0.4");
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="hero-photo-bg angular-bg relative overflow-hidden border-b border-white/10 px-4 py-24 sm:py-32"
    >
      <svg
        className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] opacity-30 sm:h-[560px] sm:w-[560px]"
        viewBox="0 0 400 400"
        fill="none"
      >
        <polygon points="400,0 400,400 0,400" fill="url(#hero-grad)" />
        <defs>
          <linearGradient id="hero-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <div className="relative mx-auto max-w-4xl text-center">
        <div className="hero-logo flex justify-center">
          <Logo height={80} />
        </div>
        <div className="hero-live-pill mt-6 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/40 bg-gradient-to-r from-violet-500/15 to-pink-500/15 px-4 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-fuchsia-400" />
            </span>
            <span className="font-heading text-xs uppercase tracking-[0.2em] text-fuchsia-300">
              Coaches are looking now
            </span>
          </span>
        </div>
        <p className="hero-tagline mt-4 font-heading text-sm uppercase tracking-[0.3em] text-skyline-300">
          Data. Performance. Opportunity.
        </p>
        <h1 className="mt-4 text-5xl leading-[0.95] text-white sm:text-7xl">
          <span className="hero-line block">YOUR STATS DESERVE</span>
          <span className="hero-line text-gradient block">TO BE SEEN</span>
        </h1>
        <p className="hero-copy mx-auto mt-6 max-w-xl text-lg text-slate-400">
          Statline turns your performance into a recruiting profile that
          coaches actually find — built on real data, not guesswork.
        </p>

        <HeroStats />

        <Suspense fallback={null}>
          <HeroCTAs />
        </Suspense>
      </div>
    </section>
  );
}
