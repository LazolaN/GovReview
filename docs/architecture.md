# GovReview Architecture

## System Overview

GovReview is an AI-powered ICT governance review platform built for South African financial services organisations. It analyses governance documents against international and SA-specific standards using three specialist AI agents running sequentially.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js (App Router) | 16.2.2 |
| Language | TypeScript | 5.x (strict mode) |
| Styling | Tailwind CSS | 4.2.2 |
| AI | Anthropic Claude API | claude-sonnet-4-20250514 (agents), claude-haiku-4-5-20251001 (classification) |
| State | Zustand (global), React hooks (local) | |
| PDF Parsing | pdf-parse | |
| DOCX Parsing | mammoth.js | |
| Motion | Framer Motion, CSS animations | |
| Charts | Recharts (planned), custom SVG radar | |

## Architecture Diagram

```
Client (Browser)
  |
  ├── React UI (Next.js App Router)
  |     ├── Dashboard (/)
  |     ├── Review (/review) -- upload + agent analysis
  |     ├── Library (/library) -- review history
  |     └── Reports (/reports) -- generated reports
  |
  ├── Zustand Store (review-store.ts)
  |     └── Review state, agent status, streams
  |
  └── API Routes (server-side)
        ├── POST /api/upload -- file upload + text extraction + classification
        └── POST /api/analyze -- Claude API proxy with streaming SSE
              |
              └── Anthropic Claude API (claude-sonnet-4-20250514)
```

## Agent Pipeline

Agents execute sequentially. Each downstream agent receives upstream results as additional context.

```
1. Lead Consultant (ICT Governance Specialist)
   Standards: COBIT 2019, King IV, ISO 38500, POPIA, FSCA
   Output: Maturity scores (5 dimensions), strengths, gaps, recommendations
      |
      v
2. Senior Data & AI Analyst
   Standards: NIST AI RMF, DAMA-DMBOK 2, EU AI Act, IEEE Ethics
   Output: Standards alignment matrix, risk register (top 10), gap analysis
      |
      v
3. Project Manager
   Output: Executive summary, remediation roadmap (4 phases),
           RACI matrix, ZAR cost estimates, risk-of-inaction
```

## Document Processing

```
Upload (PDF/DOCX/TXT/MD, max 20MB)
  -> Validate file type and size
  -> Extract text (pdf-parse / mammoth.js / direct read)
  -> Auto-classify with Claude Haiku
  -> Return extracted text + metadata to client
```

Large documents (>80k chars) are chunked with 2k char overlap, split at paragraph or sentence boundaries.

## Key Design Decisions

1. **Sequential agents** -- downstream agents benefit from upstream context
2. **SSE streaming** -- real-time text output during agent analysis
3. **Client-side orchestration** -- orchestrator runs in the browser, calls API routes sequentially
4. **Dark theme** -- editorial authority aesthetic for C-suite users
5. **No database yet** -- Phase 1 stores everything in memory; Phase 2 adds Supabase

## Directory Structure

```
src/
  app/           -- Next.js pages and API routes
  components/    -- React components (ui, layout, upload, agents, review, reports)
  lib/           -- Core logic (agents, documents, anthropic client, utils)
  stores/        -- Zustand state stores
  hooks/         -- Custom React hooks
  types/         -- TypeScript type definitions
```
