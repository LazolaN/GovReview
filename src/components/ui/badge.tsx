import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "governance" | "data" | "ai" | "risk" | "success";
}

const variantStyles = {
  default: "bg-bg-tertiary text-text-secondary border-border",
  governance: "bg-accent-governance/10 text-accent-governance border-accent-governance/20",
  data: "bg-accent-data/10 text-accent-data border-accent-data/20",
  ai: "bg-accent-ai/10 text-accent-ai border-accent-ai/20",
  risk: "bg-accent-risk/10 text-accent-risk border-accent-risk/20",
  success: "bg-accent-success/10 text-accent-success border-accent-success/20",
};

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-md border",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
