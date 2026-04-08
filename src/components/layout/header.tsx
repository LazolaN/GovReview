"use client";

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-bg-primary/80 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-8">
      <div>
        <h2 className="text-lg font-display text-text-primary">{title}</h2>
        {subtitle && (
          <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </header>
  );
}
