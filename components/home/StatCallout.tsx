import { CountUp } from "@/components/ui/CountUp";

export function StatCallout({ count }: { count: number }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:py-20">
      <span className="font-heading text-7xl font-extrabold leading-none tracking-tight text-electric-500 sm:text-8xl">
        <CountUp value={count} />
      </span>
      <p className="mt-4 text-sm font-bold uppercase tracking-[0.16em] text-slate-400">
        Athlete Profiles Built
      </p>
    </div>
  );
}
