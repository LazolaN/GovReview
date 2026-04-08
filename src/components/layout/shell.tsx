"use client";

import { Sidebar } from "./sidebar";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen">{children}</main>
    </div>
  );
}
