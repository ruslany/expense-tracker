# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm run dev          # Start Next.js development server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint check
npm run format       # Prettier format all .ts/.tsx files

# Database (Prisma)
npx prisma generate              # Regenerate Prisma Client after schema changes
npx prisma migrate dev --name X  # Create and apply new migration
npx prisma studio                # Database GUI

# Docker
docker build -t expense-tracker .  # Build Docker image
```

## Architecture Overview

This is a personal expense tracking app built with Next.js 16 (App Router), TypeScript (strict mode), and PostgreSQL. It supports multi-user access with Google OAuth authentication and role-based authorization (admin/reader).

### Tech Stack
- **Frontend**: React 19, Tailwind CSS 4, Radix UI components, Recharts, Lucide icons
- **Backend**: Next.js API routes, Prisma 7 ORM with pg adapter
- **Auth**: NextAuth v5 (beta) with Google OAuth, role-based access control
- **Validation**: Zod 4 schemas in `lib/validations.ts`
- **Tables**: TanStack React Table v8
- **CSV Parsing**: PapaParse with institution-specific field mappings
- **Date handling**: date-fns / date-fns-tz
- **Toasts**: Sonner
- **Themes**: next-themes (dark/light mode)
- **Market data**: yahoo-finance2

### Project Structure

```
app/                    # Next.js App Router (pages + API routes)
  api/                  # REST API endpoints
  administration/       # Admin panel (accounts, categories, tags, users)
  auth/                 # Sign-in and error pages
  big-expenses/         # Tag-based big expense reports
  import/               # CSV import UI
  investments/          # Investment watchlist
  tags/                 # Tag management
  transactions/         # Transaction browser
  trends/               # Spending trends analysis
components/             # React components organized by feature
  ui/                   # shadcn/ui base components (Radix + Tailwind)
  dashboard/            # Dashboard charts and tables
  transactions/         # Transaction table, filters, dialogs
  import/               # CSV uploader and import history
  administration/       # Admin CRUD components
  spending-trends/      # Trends charts and stats
  big-expenses/         # Tag-based expense reports
  investments/          # Watchlist table and TradingView chart
  tag-report/           # Category breakdown for tags
hooks/                  # Custom React hooks (use-media-query)
lib/                    # Business logic and utilities
  prisma.ts             # Prisma singleton (Azure AD token support)
  auth.ts               # NextAuth config (Google OAuth)
  authorization.ts      # requireAuth(), requireAdmin(), isAdmin()
  validations.ts        # Zod schemas for all entities
  csv-parser.ts         # CSV parsing with institution mappings
  data.ts               # Server-side data fetching functions
  market-data.ts        # Yahoo Finance integration (5min cache)
  utils.ts              # cn(), formatCurrency(), formatDate(), computeContentHash()
  generated/prisma/     # Auto-generated Prisma types (custom location)
types/index.ts          # Shared TypeScript type definitions
prisma/schema.prisma    # Database schema
infra/                  # Azure Bicep infrastructure-as-code
```

### Key Patterns

**Prisma Client**: Uses singleton pattern with connection pooling via `@prisma/adapter-pg`. Supports Azure AD managed identity tokens for Azure PostgreSQL. Import from `lib/prisma.ts`:
```typescript
import { prisma } from "@/lib/prisma";
```

**Prisma Types**: Generated types are in `lib/generated/prisma` (not the default location). After schema changes, run `npx prisma generate`.

**Authentication & Authorization**: NextAuth v5 with Google OAuth. Auth helpers in `lib/authorization.ts`:
```typescript
import { requireAuth, requireAdmin } from "@/lib/authorization";
// In API routes:
const session = await requireAuth();    // throws 401 if not authenticated
const session = await requireAdmin();   // throws 403 if not admin role
```

**API Validation**: All API routes use Zod schemas from `lib/validations.ts` for request validation.

**CSV Import Flow**: CSV files are parsed according to institution-specific mappings defined in `lib/csv-parser.ts`. Supported institutions: Fidelity, Costco Citi, American Express, FirstTech Credit Union, Manual Entry. Features include duplicate detection via content hash, keyword-based category auto-detection, and tag auto-detection.

**UI Components**: Built on shadcn/ui (Radix UI + Tailwind) in `components/ui/`. Feature components use dialog modals for CRUD, popovers for inline editing (e.g., transaction notes), and type-to-confirm for destructive actions.

### Database Models
- **Account**: Credit cards/bank accounts with institution type
- **Transaction**: Individual transactions linked to accounts, with JSON `originalData` field, content hash for deduplication, optional notes, and category/tag associations
- **CSVMapping**: Institution-specific CSV field mappings (stored in DB for extensibility)
- **Category**: Categories with keyword arrays for auto-detection
- **Tag**: Labels for transactions; `isBigExpense` flag for big expense reports
- **TransactionTag**: Many-to-many junction between Transaction and Tag
- **ImportHistory**: Audit trail for CSV imports
- **WatchlistItem**: Investment instruments (ETF/mutual fund/stock) tracked via Yahoo Finance
- **UserRole**: Email-based role assignments (admin/reader)

### API Routes

| Route | Purpose |
|-------|---------|
| `/api/accounts` | CRUD for accounts |
| `/api/transactions` | CRUD with search/filter/pagination |
| `/api/transactions/[id]/tags` | Update transaction tags |
| `/api/categories` | CRUD for categories |
| `/api/tags` | CRUD for tags |
| `/api/upload` | CSV file upload and parsing (admin only) |
| `/api/dashboard` | Aggregated dashboard statistics |
| `/api/watchlist` | CRUD for investment watchlist |
| `/api/watchlist/search` | Symbol search via Yahoo Finance |
| `/api/users` | User role management (admin only) |
| `/api/auth/[...nextauth]` | NextAuth endpoints |

### Adding New Credit Card Institutions
1. Add institution type to the `Institution` union in `types/index.ts`
2. Add field mapping to `defaultMappings` in `lib/csv-parser.ts`
3. Add option to the institution select dropdown in `components/import/csv-uploader.tsx`

### Deployment
- **Docker**: Multi-stage build with Node 22 Alpine, standalone Next.js output
- **Azure**: Container Apps deployment via Bicep templates in `infra/`, with Azure PostgreSQL Flexible Server and managed identity auth
- **Recipes**: `justfile` contains build, deploy, and migration commands
