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
        "card-gradient card-glow rounded-xl border border-white/10",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}
