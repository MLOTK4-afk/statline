function BoltIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4z" />
      <path d="M8 5H5a2 2 0 0 0 2 4" />
      <path d="M16 5h3a2 2 0 0 1-2 4" />
      <path d="M12 13v3" />
      <path d="M9 20h6" />
      <path d="M10 16h4l1 4H9l1-4z" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.5" fill="currentColor" />
    </svg>
  );
}

const STATS = [
  {
    icon: BoltIcon,
    value: "Free",
    label: "to build your profile",
    badgeClass: "border-electric-500/30 bg-electric-500/10 text-electric-500",
  },
  {
    icon: TrophyIcon,
    value: "15",
    label: "sports supported",
    badgeClass: "border-electric-500/30 bg-electric-500/10 text-electric-500",
  },
  {
    // Tertiary accent: the one flare-colored touch on the homepage, marking
    // Fit Score as the standout feature rather than adding a third brand hue.
    icon: TargetIcon,
    value: "Fit Score",
    label: "on every profile",
    badgeClass:
      "border-fuchsia-400/40 bg-gradient-to-br from-violet-500/20 to-pink-500/20 text-fuchsia-300",
  },
];

export function HeroStats() {
  return (
    <div className="hero-stats mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
      {STATS.map(({ icon: Icon, value, label, badgeClass }) => (
        <div key={label} className="flex items-center gap-2.5">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${badgeClass}`}
          >
            <Icon />
          </span>
          <span className="text-left leading-tight">
            <span className="block font-heading text-base text-white">
              {value}
            </span>
            <span className="block text-xs text-slate-400">{label}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
