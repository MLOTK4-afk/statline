import { cn } from "@/lib/cn";

export function Card({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn(
        "card-gradient rounded-xl border border-white/10 shadow-xl shadow-black/20",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}
