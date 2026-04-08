"use client";

import Link from "next/link";
import { Shell } from "@/components/layout/shell";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileSearch, Inbox } from "lucide-react";

export default function LibraryPage() {
  // Phase 2: This will be populated from Supabase
  // For now, show empty state directing to new review

  return (
    <Shell>
      <Header
        title="Review Library"
        subtitle="Browse and manage your governance reviews"
        action={
          <Link href="/review">
            <Button size="sm">
              <FileSearch className="w-3.5 h-3.5" />
              New Review
            </Button>
          </Link>
        }
      />

      <div className="p-8">
        {/* Empty state */}
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-bg-tertiary flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-8 h-8 text-text-tertiary" />
            </div>
            <h3 className="font-display text-lg text-text-primary">
              No reviews yet
            </h3>
            <p className="text-sm text-text-secondary mt-2 max-w-md mx-auto">
              Start your first governance review by uploading a policy document,
              framework, or governance manual. Your review history will appear
              here.
            </p>
            <Link href="/review" className="inline-block mt-6">
              <Button>
                <FileSearch className="w-4 h-4" />
                Start First Review
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Future: Review list with filters */}
        <div className="mt-8 grid grid-cols-4 gap-4">
          {["All Reviews", "AI Governance", "Data Governance", "IT Governance"].map(
            (filter) => (
              <button
                key={filter}
                className="px-4 py-2 text-xs text-text-tertiary bg-bg-secondary border border-border rounded-lg hover:border-border-hover hover:text-text-secondary transition-colors text-center cursor-not-allowed opacity-50"
                disabled
              >
                {filter}
              </button>
            )
          )}
        </div>
      </div>
    </Shell>
  );
}
