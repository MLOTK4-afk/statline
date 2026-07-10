export function CompletenessMeter({
  percent,
  missing,
}: {
  percent: number;
  missing: string[];
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between text-sm text-slate-300">
        <span>Profile completeness</span>
        <span className="font-heading text-lg text-white">{percent}%</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-electric-500 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
      {missing.length > 0 && (
        <p className="mt-2 text-xs text-slate-500">
          Still missing: {missing.join(", ")}
        </p>
      )}
    </div>
  );
}
