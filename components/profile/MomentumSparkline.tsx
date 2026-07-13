/** Lightweight inline-SVG sparkline -- no chart library dependency. */
export function MomentumSparkline({
  counts,
  className,
}: {
  counts: number[];
  className?: string;
}) {
  const width = 240;
  const height = 48;
  const max = Math.max(1, ...counts);
  const step = counts.length > 1 ? width / (counts.length - 1) : width;

  const points = counts
    .map((c, i) => {
      const x = i * step;
      const y = height - (c / max) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
      role="img"
      aria-label="Profile views over the last 30 days"
    >
      <polygon points={areaPoints} className="fill-electric-500/10" />
      <polyline
        points={points}
        fill="none"
        className="stroke-electric-500"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
