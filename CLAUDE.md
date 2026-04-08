@AGENTS.md

# CLAUDE.md - ICT Governance Review Platform (GovReview)

## Project Identity

**Name:** GovReview - AI-Powered ICT Governance Review Platform
**Owner:** Ubuntu Data Solutions (Pty) Ltd
**Domain:** ICT Governance Advisory for South African Financial Services
**Currency:** South African Rand (ZAR) - always
**Target Users:** Governance consultants, CIOs, CISOs, CDOs, Board IT Committee members at pension funds, insurers, banks, and regulated entities

## Coding Philosophy

Question assumptions. Plan architecture first. Craft elegant code with meaningful names. Iterate until excellent. Simplify ruthlessly. Never use the words "delve," "intricate," or "realm." Never use em dashes.

## Tech Stack

- Frontend: Next.js 16 (App Router) / React 19 / TypeScript (strict)
- Styling: Tailwind CSS 4 (CSS-based config, no tailwind.config.ts)
- State: Zustand for global state
- AI: Anthropic Claude API (claude-sonnet-4-20250514 for agents, claude-haiku-4-5-20251001 for classification)
- PDF: pdf-parse (PDFParse class API)
- DOCX: mammoth.js
- Fonts: Instrument Serif (display) + DM Sans (body) + JetBrains Mono (mono)

## Commands

```bash
npm run dev    # Start dev server
npm run build  # Production build
npm run lint   # ESLint
```

## Quality Gates

- TypeScript strict mode, no `any` types
- All API routes validate input with Zod
- All costs in ZAR, all dates in DD MMM YYYY format
- Lighthouse > 90 for performance and accessibility
- Never expose ANTHROPIC_API_KEY to frontend

## Prohibited Patterns

- No console.log in production (use structured logger)
- No hardcoded API keys
- No extracted text in client-side storage
- No `any` type
- No generic fonts (Inter, Roboto, Arial)
- No purple gradients on white backgrounds
- No "delve," "intricate," or "realm" in UI copy
- No em dashes in UI copy
