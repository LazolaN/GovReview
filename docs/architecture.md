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
| Database | Supabase (PostgreSQL) or in-memory fallback | |
| Storage | Supabase Storage or in-memory | |
| PDF Parsing | pdf-parse | |
| DOCX Parsing | mammoth.js | |
| Report Gen | docx (npm package) | |
| Motion | Framer Motion, CSS animations | |
| Charts | Custom SVG radar + gap matrix heat map | |
| Deployment | Railway (Docker) | |

## Architecture Diagram

```
Client (Browser)
  |
  +-- React UI (Next.js App Router)
  |     +-- Dashboard (/)
  |     +-- Review (/review) -- upload + agent analysis
  |     +-- Review Detail (/review/[id]) -- saved results
  |     +-- Library (/library) -- review history with filters
  |     +-- Report Builder (/reports/[id]) -- configure + export
  |
  +-- Zustand Store (review-store.ts)
  |     +-- Review state, agent status, streams
  |
  +-- API Routes (server-side)
        +-- POST /api/upload -- file upload + extraction + classification + persistence
        +-- POST /api/analyze -- Claude API proxy with streaming SSE + rate limiting
        +-- GET  /api/reviews -- list reviews with stats
        +-- GET  /api/reviews/[id] -- full review with results
        +-- POST /api/export -- DOCX/PDF report generation
              |
              +-- Anthropic Claude API
              +-- Supabase (PostgreSQL + Storage)
```

## Agent Pipeline

Agents execute sequentially. Each downstream agent receives upstream results as additional context.

```
1. Lead Consultant (ICT Governance Specialist)
   Standards: COBIT 2019, King IV, ISO 38500, POPIA, FSCA
   Output: Maturity scores (6 dimensions), strengths, gaps, recommendations
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

## Data Persistence

Dual-mode storage layer (`src/lib/db.ts`):
- **Supabase mode**: Full PostgreSQL persistence with Supabase Storage for documents
- **In-memory mode**: Map-based fallback for local development without Supabase

Tables: `reviews`, `documents`, `agent_results`, `reports`

## Report Generation

```
Agent Outputs (3x markdown)
  -> Parse structured sections (extractSection)
  -> Build DOCX using docx npm package:
     - Cover page (client name, date, confidential)
     - Table of Contents
     - Executive Summary, Current State, Gap Analysis
     - Maturity table, Standards Alignment, Roadmap, RACI
     - Appendices (full agent outputs)
  -> Return binary DOCX for download
```

## Security

- Rate limiting: 10 analyses/hour/IP (in-memory sliding window)
- Security headers: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- API key never exposed to client (proxied through API routes)
- Zod validation on all API inputs
- AbortController for stream cleanup on navigation

## Deployment (Railway)

- Dockerfile with multi-stage build (deps -> build -> runner)
- Standalone Next.js output mode
- `railway.json` for Railway platform config
- Environment variables configured in Railway dashboard

## Directory Structure

```
src/
  app/           -- Next.js pages and API routes
  components/    -- React components (ui, layout, upload, agents, review, reports)
  lib/           -- Core logic (agents, documents, reports, anthropic, db, utils)
  stores/        -- Zustand state stores
  hooks/         -- Custom React hooks
  types/         -- TypeScript type definitions
supabase/
  migrations/    -- SQL schema migrations
docs/            -- Project documentation
```
