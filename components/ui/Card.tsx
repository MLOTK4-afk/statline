import { cn } from "@/lib/cn";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "card-gradient rounded-xl border border-white/10 shadow-xl shadow-black/20",
        className
      )}
    >
      {children}
    </div>
  );
}
