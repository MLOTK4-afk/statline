export function StatTile({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
      <div className="font-heading text-4xl text-white">{value}</div>
      <div className="mt-1 text-sm uppercase tracking-wider text-slate-400">
        {label}
      </div>
    </div>
  );
}
