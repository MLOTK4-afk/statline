import { SPORTS } from "@/lib/constants";

/**
 * An infinite-scrolling ticker of every sport Statline supports. Stands in
 * for the "trusted by these partner logos" marquee pattern seen on agency
 * sites -- but Statline has no real outside partnerships to display, so
 * this shows something true instead: the sports it actually supports.
 *
 * Pure CSS animation (no GSAP) since it's a simple constant loop, not a
 * scroll-triggered reveal. The list is duplicated once so the loop from
 * x:0 to x:-50% is seamless.
 */
export function SportsMarquee() {
  return (
    <div className="marquee-mask overflow-hidden border-t border-white/10 py-5">
      <div className="marquee-track flex w-max gap-3.5">
        {[...SPORTS, ...SPORTS].map((sport, i) => (
          <span
            key={`${sport}-${i}`}
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] px-4.5 py-2 text-sm font-semibold text-slate-300"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-electric-500" />
            {sport}
          </span>
        ))}
      </div>
    </div>
  );
}
