"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Animates a number counting up from 0 to `value` the first time it scrolls
 * into view, then holds -- same ScrollTrigger pattern as Reveal.tsx, just
 * tweening a number instead of opacity/position.
 */
export function CountUp({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reduceMotion || !ref.current) {
        if (ref.current) ref.current.textContent = String(value);
        return;
      }

      const counter = { val: 0 };
      gsap.to(counter, {
        val: value,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 85%",
          once: true,
        },
        onUpdate: () => {
          if (ref.current) {
            ref.current.textContent = String(Math.round(counter.val));
          }
        },
      });
    },
    { scope: ref, dependencies: [value] }
  );

  return (
    <span ref={ref} className={className}>
      0
    </span>
  );
}
