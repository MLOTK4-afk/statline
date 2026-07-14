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
          <span className="pill-glow-orange inline-flex items-center gap-2 px-4 py-1.5">
            <svg
              className="animate-flame-flicker h-3.5 w-3.5 text-orange-400"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.176 7.547 7.547 0 01-1.705-1.715.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.313-1.172c.628.465 1.35.81 2.133 1.005a3.75 3.75 0 011.567-3.554 4.5 4.5 0 011.72 1.5 3.75 3.75 0 011.893 2.221z" />
            </svg>
            <span className="font-heading text-xs uppercase tracking-[0.2em] text-orange-300">
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
