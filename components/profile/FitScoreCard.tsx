import type { FitScoreResult } from "@/lib/fitScore";

export function FitScoreCard({ result }: { result: FitScoreResult }) {
  return (
    <div className="mt-6 rounded-lg border border-electric-500/30 bg-electric-500/5 p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg text-electric-500">
          Program Fit Score
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-white">{result.score}</span>
          <span className="rounded-full border border-electric-500/50 bg-electric-500/20 px-2.5 py-0.5 text-xs font-heading uppercase tracking-wider text-electric-500">
            {result.tier}
          </span>
        </div>
      </div>
      <ul className="mt-3 space-y-1.5">
        {result.explanation.map((line, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-electric-500" />
            {line}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-slate-500">
        Estimated from placeholder division benchmarks — not yet verified
        recruiting data.
      </p>
    </div>
  );
}
