"use client";

import Link from "next/link";
import { Shell } from "@/components/layout/shell";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileSearch,
  ShieldCheck,
  Database,
  GanttChart,
  ArrowRight,
  BarChart3,
  FileText,
  TrendingUp,
} from "lucide-react";

const capabilities = [
  {
    icon: ShieldCheck,
    title: "ICT Governance Assessment",
    description:
      "COBIT 2019, King IV, ISO 38500, POPIA compliance analysis with maturity scoring across five dimensions",
    accentClass: "text-accent-governance bg-accent-governance/10",
    badgeVariant: "governance" as const,
    badge: "Lead Consultant",
  },
  {
    icon: Database,
    title: "Data & AI Gap Analysis",
    description:
      "Benchmarking against NIST AI RMF, DAMA-DMBOK 2, EU AI Act with risk register and standards alignment",
    accentClass: "text-accent-data bg-accent-data/10",
    badgeVariant: "data" as const,
    badge: "Data & AI Analyst",
  },
  {
    icon: GanttChart,
    title: "Implementation Roadmap",
    description:
      "Prioritised remediation with RACI matrix, ZAR cost estimates, and governance committee recommendations",
    accentClass: "text-accent-ai bg-accent-ai/10",
    badgeVariant: "ai" as const,
    badge: "Project Manager",
  },
];

const stats = [
  { label: "Frameworks Covered", value: "12+", icon: BarChart3 },
  { label: "Analysis Dimensions", value: "6", icon: TrendingUp },
  { label: "Report Sections", value: "8", icon: FileText },
];

export default function DashboardPage() {
  return (
    <Shell>
      <Header
        title="Dashboard"
        subtitle="AI-Powered ICT Governance Review Platform"
        action={
          <Link href="/review">
            <Button>
              <FileSearch className="w-4 h-4" />
              New Review
            </Button>
          </Link>
        }
      />

      <div className="p-8 space-y-8">
        {/* Hero section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-bg-secondary via-bg-secondary to-accent-governance/5 border border-border p-10">
          {/* Gradient mesh accent */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-accent-governance/8 via-transparent to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-gradient-to-tr from-accent-data/5 via-transparent to-transparent rounded-full blur-3xl" />

          <div className="relative z-10 max-w-2xl">
            <h1 className="font-display text-4xl text-text-primary leading-tight">
              Governance Review,
              <br />
              <span className="text-accent-governance">Reimagined</span>
            </h1>
            <p className="text-text-secondary mt-4 text-base leading-relaxed max-w-lg">
              Upload your ICT governance documents and receive comprehensive
              analysis from three specialist AI agents. Benchmarked against
              COBIT 2019, King IV, POPIA, and 12+ international standards.
            </p>

            <div className="flex items-center gap-4 mt-8">
              <Link href="/review">
                <Button size="lg">
                  Start a Review
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/library">
                <Button variant="secondary" size="lg">
                  View Library
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="relative z-10 flex gap-8 mt-10 pt-8 border-t border-border/50">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-bg-tertiary flex items-center justify-center">
                  <Icon className="w-5 h-5 text-text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-display text-text-primary">
                    {value}
                  </p>
                  <p className="text-xs text-text-tertiary">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent capabilities */}
        <div>
          <h2 className="font-display text-xl text-text-primary mb-4">
            Analysis Agents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {capabilities.map(
              ({ icon: Icon, title, description, accentClass, badgeVariant, badge }) => (
                <Card key={title} className="hover:border-border-hover transition-colors">
                  <CardContent className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${accentClass}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge variant={badgeVariant}>{badge}</Badge>
                    </div>
                    <h3 className="text-sm font-medium text-text-primary">
                      {title}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {description}
                    </p>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </div>

        {/* SA Regulatory Context */}
        <Card>
          <CardHeader>
            <h2 className="font-display text-lg text-text-primary">
              South African Regulatory Context
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "King IV", detail: "Principle 12: Technology & Information Governance" },
                { name: "POPIA", detail: "Protection of Personal Information Act" },
                { name: "FSCA", detail: "Financial Sector Conduct Authority" },
                { name: "Pension Funds Act", detail: "Retirement fund governance requirements" },
              ].map(({ name, detail }) => (
                <div
                  key={name}
                  className="bg-bg-primary rounded-lg p-4 border border-border"
                >
                  <p className="text-sm font-display text-text-primary">
                    {name}
                  </p>
                  <p className="text-xs text-text-tertiary mt-1">{detail}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
