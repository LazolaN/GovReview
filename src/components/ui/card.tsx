import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  accentColor?: string;
  glow?: boolean;
}

export function Card({
  className,
  accentColor,
  glow,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-bg-secondary border border-border rounded-xl overflow-hidden transition-all duration-300",
        glow && "shadow-[0_0_20px_rgba(59,130,246,0.1)]",
        className
      )}
      style={
        accentColor
          ? { borderLeftWidth: "3px", borderLeftColor: accentColor }
          : undefined
      }
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 py-4 border-b border-border", className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 py-4", className)} {...props}>
      {children}
    </div>
  );
}
