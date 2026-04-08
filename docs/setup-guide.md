# GovReview Setup Guide

## Prerequisites

- Node.js 18+ (recommended: 20+)
- npm 9+
- An Anthropic API key with access to Claude Sonnet and Haiku

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
```

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

## Build

```bash
npm run build
npm start
```

## Project Structure

See `docs/architecture.md` for full details.

## Phase Roadmap

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Core MVP: upload, agents, review UI | In progress |
| 2 | Persistence: Supabase, auth, history | Planned |
| 3 | Reports: DOCX/PDF generation | Planned |
| 4 | Productisation: billing, RAG, API | Planned |
