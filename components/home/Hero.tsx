import { Suspense } from "react";
import { Logo } from "@/components/layout/Logo";
import { HeroCTAs } from "@/components/home/HeroCTAs";

export function Hero() {
  return (
    <section className="angular-bg relative overflow-hidden border-b border-white/10 px-4 py-24 sm:py-32">
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
        <div className="flex justify-center">
          <Logo height={80} />
        </div>
        <p className="mt-6 font-heading text-sm uppercase tracking-[0.3em] text-skyline-300">
          Data. Performance. Opportunity.
        </p>
        <h1 className="mt-4 text-5xl leading-[0.95] text-white sm:text-7xl">
          YOUR STATS DESERVE
          <br />
          <span className="text-gradient">TO BE SEEN</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-slate-400">
          Statline turns your performance into a recruiting profile that
          coaches actually find — built on real data, not guesswork.
        </p>

        <Suspense fallback={null}>
          <HeroCTAs />
        </Suspense>
      </div>
    </section>
  );
}
