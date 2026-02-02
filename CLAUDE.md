# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm run dev          # Start Next.js development server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint check

# Database (Prisma)
npx prisma generate              # Regenerate Prisma Client after schema changes
npx prisma migrate dev --name X  # Create and apply new migration
npx prisma studio                # Database GUI

# Docker
docker build -t expense-tracker .  # Build Docker image
```

## Architecture Overview

This is a personal expense tracking app built with Next.js 16 (App Router), TypeScript (strict mode), and PostgreSQL.

### Tech Stack
- **Frontend**: React 19, Tailwind CSS 4, Radix UI components, Recharts
- **Backend**: Next.js API routes, Prisma 7 ORM with pg adapter
- **Validation**: Zod 4 schemas in `lib/validations.ts`
- **Tables**: Tanstack React Table v8
- **CSV Parsing**: PapaParse with institution-specific field mappings

### Key Patterns

**Prisma Client**: Uses singleton pattern with connection pooling via `@prisma/adapter-pg`. Import from `lib/prisma.ts`:
```typescript
import { prisma } from "@/lib/prisma";
```

**Prisma Types**: Generated types are in `lib/generated/prisma` (not the default location). After schema changes, run `npx prisma generate`.

**API Validation**: All API routes use Zod schemas from `lib/validations.ts` for request validation.

**CSV Import Flow**: CSV files are parsed according to institution-specific mappings defined in `lib/csv-parser.ts`. Supported institutions: Fidelity, Costco Citi, American Express.

### Database Models
- **Account**: Credit cards/bank accounts
- **Transaction**: Individual transactions linked to accounts, with JSON `originalData` field storing raw CSV data
- **CSVMapping**: Institution-specific CSV field mappings (stored in DB for extensibility)
- **Category**: Hierarchical categories with self-referential parent/child structure
- **ImportHistory**: Audit trail for CSV imports

### Adding New Credit Card Institutions
1. Add institution type to `types/index.ts`
2. Add field mapping to `defaultMappings` in `lib/csv-parser.ts`
3. Add option to select dropdown in `components/csv-uploader.tsx`
