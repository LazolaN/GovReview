"use client";

import Link from "next/link";
import { Shell } from "@/components/layout/shell";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileSearch, FileOutput } from "lucide-react";

export default function ReportsPage() {
  return (
    <Shell>
      <Header
        title="Reports"
        subtitle="Generated governance review reports"
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
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-bg-tertiary flex items-center justify-center mx-auto mb-4">
              <FileOutput className="w-8 h-8 text-text-tertiary" />
            </div>
            <h3 className="font-display text-lg text-text-primary">
              No reports generated
            </h3>
            <p className="text-sm text-text-secondary mt-2 max-w-md mx-auto">
              Complete a governance review analysis to generate comprehensive
              DOCX reports. Report generation will be available in Phase 3.
            </p>
            <Link href="/review" className="inline-block mt-6">
              <Button>
                <FileSearch className="w-4 h-4" />
                Start a Review
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
