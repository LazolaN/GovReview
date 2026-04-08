"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-governance/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          // Variants
          variant === "primary" &&
            "bg-accent-governance text-white hover:bg-accent-governance/90 active:bg-accent-governance/80",
          variant === "secondary" &&
            "bg-bg-tertiary text-text-primary border border-border hover:border-border-hover hover:bg-bg-secondary",
          variant === "ghost" &&
            "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary",
          variant === "danger" &&
            "bg-accent-risk/10 text-accent-risk border border-accent-risk/20 hover:bg-accent-risk/20",
          // Sizes
          size === "sm" && "h-8 px-3 text-xs rounded-md",
          size === "md" && "h-10 px-4 text-sm rounded-lg",
          size === "lg" && "h-12 px-6 text-base rounded-lg",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
