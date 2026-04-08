# GovReview Setup Guide

## Prerequisites

- Node.js 20+
- npm 9+
- An Anthropic API key with access to Claude Sonnet and Haiku
- (Optional) Supabase project for persistence

## Installation

```bash
cd govreview
npm install
```

## Configuration

Copy the environment template and add your API key:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Optional: Supabase for persistence (works without it using in-memory storage)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Supabase Setup (Optional)

1. Create a Supabase project at https://supabase.com
2. Run the migration: `supabase/migrations/001_initial.sql`
3. Create a Storage bucket named `documents`
4. Add the Supabase environment variables to `.env.local`

Without Supabase, the app uses in-memory storage (data is lost on restart).

## Development

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

## Usage

1. Navigate to `/review`
2. Upload a governance document (PDF, DOCX, TXT, or MD, up to 20MB)
3. The document will be auto-classified (AI Policy, Data Framework, IT Governance, etc.)
4. Click "Start Analysis" to run the three-agent pipeline
5. Watch results stream in real time
6. Review maturity scores, gap analysis, and implementation roadmap
7. Visit `/library` to see all past reviews
8. Click into a review to see saved results
9. Generate a DOCX report from `/reports/[reviewId]`

## Build

```bash
npm run build
npm start
```

## Railway Deployment

The project includes a `Dockerfile` and `railway.json` for Railway deployment:

1. Connect your GitHub repo to Railway
2. Set environment variables in the Railway dashboard:
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL` (optional)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (optional)
   - `SUPABASE_SERVICE_ROLE_KEY` (optional)
3. Railway will auto-detect the Dockerfile and deploy

## Project Structure

See `docs/architecture.md` for full details.

## Phase Roadmap

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Core MVP: upload, agents, review UI, rate limiting | Complete |
| 2 | Persistence: Supabase, library, review detail, gap matrix | Complete |
| 3 | Reports: DOCX generation, report builder UI | Complete |
| 4 | Productisation: auth, billing, RAG, API | Planned |
