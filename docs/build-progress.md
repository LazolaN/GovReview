# GovReview Build Progress

## Phase 1: Core MVP

### Completed -- 08 Apr 2026

**Project Scaffold**
- Next.js 16.2.2 with TypeScript strict mode
- Tailwind CSS v4 with CSS-based theme configuration
- Instrument Serif (display) + DM Sans (body) + JetBrains Mono (code) fonts
- Dark editorial design system with governance colour palette
- Custom CSS animations (pulse glow, shimmer, fade-in, slide-in)
- Glassmorphism and noise texture overlay

**Type System**
- Full TypeScript types for agents, documents, reviews, and reports
- Agent definitions with metadata (name, title, accent colour, icon, order)
- Document types with classification labels and file type validation
- Maturity score and risk item types for structured output parsing

**Agent System**
- Three agent system prompts (Lead Consultant, Data & AI Analyst, Project Manager)
- Agent orchestrator with sequential execution and upstream context passing
- Structured output parser extracting maturity scores and risk registers from markdown
- Max 2 retries per agent with exponential backoff
- SSE streaming support for real-time output

**Document Processing**
- PDF text extraction via pdf-parse
- DOCX text extraction via mammoth.js
- TXT/MD direct read
- File validation (type + 20MB size limit)
- Auto-classification using Claude Haiku
- Document chunking for large files (>80k chars) with overlap

**API Routes**
- `POST /api/upload` -- file upload, text extraction, auto-classification
- `POST /api/analyze` -- Claude API proxy with SSE streaming, Zod validation

**UI Components**
- Layout: sidebar navigation, header, shell
- Upload: drag-and-drop zone with progress stages, document preview with metadata
- Agents: agent cards with status indicators, streaming output, markdown rendering
- Review: timeline progress tracker, maturity radar chart (SVG)
- Base: button (4 variants), card (with accent border + glow), badge (6 variants)

**Pages**
- Dashboard (`/`) -- hero section, agent capabilities, SA regulatory context
- Review (`/review`) -- full upload-to-analysis flow with sidebar
- Library (`/library`) -- empty state (Phase 2)
- Reports (`/reports`) -- empty state (Phase 3)

**State Management**
- Zustand review store with agent statuses, results, and stream content
- Upload hook with progress tracking
- Agent hook for orchestrator integration

**Robustness Fixes -- 08 Apr 2026**
- Fixed critical extractSection regex bug (multiline $ matching every line end)
- Added maturity score clamping to valid 1-5 range
- Fixed retry stream accumulation (partial content no longer duplicates on retry)
- Added AbortController support for cancelling agent runs on navigation
- Added clearAgentStream to Zustand store for retry cleanup
- Fixed upload API response missing reviewId and filePath fields
- Added try/catch around stream reader in anthropic.ts for mid-stream errors
- Added JSON parse error sanitization in /api/analyze (no more internal error leaks)
- Added security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- Cleaned up all 5 unused imports (zero lint warnings)

### Outstanding (Phase 1)

- [ ] Lint and test setup (Vitest, Playwright)
- [ ] Error boundary components
- [ ] Mobile responsive layout
- [ ] Rate limiting on /api/analyze (10 requests/hour/user)
- [ ] Authentication middleware (Phase 2 dependency)
- [ ] Add rehype-sanitize to ReactMarkdown (defense in depth)

### Phase 2: Persistence and Library -- In Progress

**Completed -- 08 Apr 2026**

**Database Access Layer** (`src/lib/db.ts`)
- CRUD functions for reviews, documents, agent_results, and reports
- Dual-mode: Supabase persistence when configured, in-memory Map fallback for local dev
- Functions: createReview, getReview, getReviewsByUser, updateReviewStatus, createDocument, getDocumentsByReview, createAgentResult, getAgentResultsByReview, createReport, getReportsByReview

**Database Types Update** (`src/types/database.ts`)
- Added `Relationships` field to all table types for Supabase v2.102 compatibility
- Added `Views` and `Functions` fields to schema type

**Upload Persistence** (`src/app/api/upload/route.ts`)
- Creates review and document records in DB on upload
- Uploads files to Supabase Storage `documents` bucket when configured
- Falls back to in-memory storage for local development

**Reviews API**
- `GET /api/reviews` -- lists reviews for a user, includes document count and agent completion stats
- `GET /api/reviews/[id]` -- returns full review with documents and agent results

**Library Page** (`src/app/library/page.tsx`)
- Fetches reviews from /api/reviews
- Filter tabs: All, AI Governance, Data Governance, IT Governance
- Review cards with title, document type badge, status badge, document count, agent progress bar, date
- Empty state and loading state
- Each card links to /review/[id]

**Review Detail Page** (`src/app/review/[id]/page.tsx`)
- Fetches saved review data from /api/reviews/[id]
- Read-only agent cards with expandable output, maturity scores, duration
- Maturity radar chart in sidebar
- Review summary panel (type, documents, agents, date)
- "Generate Report" button linking to /reports/[reviewId]
- Error and loading states with back-to-library navigation

### Phase 2 (Remaining)

- Authentication with NextAuth.js (in progress)
- Gap matrix heat map integration on review detail page
- Replace placeholder user_id with authenticated user

### Phase 3: Report Export -- In Progress

**Completed -- 08 Apr 2026**

**Gap Matrix Heat Map** (`src/components/review/gap-matrix.tsx`)
- Interactive heat map showing standards alignment across 6 frameworks x 6 governance domains
- Colour-coded cells by gap severity: success (80-100%), amber (60-79%), blue (40-59%), red (0-39%)
- Staggered fade-in animation on mount
- Hover tooltips with score detail
- Optional `onCellClick` callback for drill-down
- Placeholder state when no data is available

**DOCX Report Builder** (`src/lib/reports/docx-builder.ts`)
- Full report generation using `docx` npm package
- Cover page with title, client name, date, confidentiality notice, Ubuntu Data Solutions branding
- Table of Contents placeholder
- Executive Summary, Current State Assessment, Maturity Assessment table, Gap Analysis, Standards Alignment, Remediation Roadmap, RACI Matrix, and Appendices sections
- Markdown-to-DOCX converter handling headings, bold, bullets, and numbered lists
- Maturity scores rendered as a styled table
- Configurable section selection via `ReportOptions`
- Uses `extractSection` parser to pull named sections from agent markdown output

**Report Export API** (`src/app/api/export/route.ts`)
- `POST /api/export` -- generates DOCX reports with Zod-validated input
- Supports `reviewId`, `format`, `title`, `clientName`, `sections` parameters
- Fetches agent results from Supabase if configured, falls back to request body
- Returns binary DOCX with correct Content-Type and Content-Disposition headers
- PDF format returns 501 placeholder

**Report Builder Page** (`src/app/reports/[id]/page.tsx`)
- Full report configuration UI with section checkboxes, title/client inputs
- Format selector (DOCX active, PDF disabled)
- Agent results status badges
- Content preview showing excerpts from each completed agent
- Generate button triggers download via `/api/export`
- Loading and error states

### Phase 3 (Remaining)

- PDF export implementation
- Report customisation and branding

### Phase 4 (Planned)

- Multi-tenant auth and billing
- RAG pipeline with embedded standards
- Custom agent prompt editor
- API access for consulting workflows
