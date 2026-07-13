export interface CompareBarEntry {
  name: string;
  value: number;
  displayValue: string;
  color: string;
}

/**
 * A small grouped-bar comparison for one stat across up to 3 athletes.
 * Bars are a neutral magnitude comparison only -- this never labels a
 * "winner," since most athlete stats (times, counts, percentages) don't
 * share a single "higher is better" direction, and guessing would mislead
 * a coach reading it. GPA is the one exception rendered elsewhere with the
 * same component, since GPA direction is unambiguous.
 *
 * Athlete identity color is assigned once per compare session (see
 * app/compare/page.tsx) and stays fixed across every chart on the page --
 * the persistent legend in the page header covers the "legend present for
 * 2+ series" requirement, so each individual chart doesn't repeat one.
 */
export function CompareBarChart({
  label,
  entries,
}: {
  label: string;
  entries: CompareBarEntry[];
}) {
  const max = Math.max(1, ...entries.map((e) => e.value));

  return (
    <div>
      <h3 className="text-sm text-slate-400">{label}</h3>
      <div className="mt-2 space-y-2">
        {entries.map((e) => (
          <div key={e.name} className="flex items-center gap-3">
            <span className="w-24 shrink-0 truncate text-xs text-slate-500">
              {e.name}
            </span>
            <div className="h-5 flex-1">
              <div
                title={`${e.name}: ${e.displayValue}`}
                className="h-5 rounded-r-md transition-[width]"
                style={{
                  width: `${Math.max(4, (e.value / max) * 100)}%`,
                  backgroundColor: e.color,
                }}
              />
            </div>
            <span className="w-16 shrink-0 text-right text-xs font-semibold text-white">
              {e.displayValue}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
