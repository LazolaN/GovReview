"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileSearch,
  Library,
  FileText,
  Settings,
  Shield,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/review", label: "New Review", icon: FileSearch },
  { href: "/library", label: "Library", icon: Library },
  { href: "/reports", label: "Reports", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navContent = (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between gap-3 px-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-governance/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-accent-governance" />
          </div>
          <div>
            <h1 className="font-display text-lg text-text-primary leading-tight">
              GovReview
            </h1>
            <p className="text-[10px] text-text-tertiary tracking-widest uppercase">
              ICT Governance
            </p>
          </div>
        </div>
        {/* Mobile close */}
        <button
          className="lg:hidden p-1 text-text-secondary hover:text-text-primary"
          onClick={() => setMobileOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-accent-governance/10 text-accent-governance"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-border">
        <Link
          href="/settings"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all duration-200"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
        <div className="mt-3 px-3">
          <p className="text-[10px] text-text-tertiary">
            Ubuntu Data Solutions
          </p>
          <p className="text-[10px] text-text-tertiary">v0.2.0</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-lg bg-bg-secondary border border-border flex items-center justify-center text-text-secondary hover:text-text-primary"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar: fixed on desktop, slide-in on mobile */}
      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 w-64 bg-bg-secondary border-r border-border flex flex-col z-50 transition-transform duration-300",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {navContent}
      </aside>
    </>
  );
}
