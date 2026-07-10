import { cn } from "@/lib/cn";

export function StepIndicator({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <ol className="flex items-center justify-center gap-2 sm:gap-4">
      {steps.map((label, idx) => {
        const step = idx + 1;
        const active = step === current;
        const done = step < current;
        return (
          <li key={label} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-heading text-sm",
                  done && "bg-electric-500 text-white",
                  active && "border-2 border-electric-500 text-electric-500",
                  !active && !done && "border border-white/20 text-slate-500"
                )}
              >
                {step}
              </span>
              <span
                className={cn(
                  "hidden text-sm sm:inline",
                  active ? "text-white" : "text-slate-500"
                )}
              >
                {label}
              </span>
            </div>
            {step < steps.length && (
              <span className="h-px w-6 bg-white/15 sm:w-12" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
