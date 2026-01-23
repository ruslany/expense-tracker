# Expense Tracker

A modern, full-featured personal expense tracking web application built with Next.js 14, TypeScript, and PostgreSQL.

## Features

- **Dashboard**: Overview of your expenses with interactive charts and summary cards
- **CSV Import**: Upload and parse CSV files from multiple credit card institutions (Fidelity, Costco Citi, American Express)
- **Transaction Management**: View, search, filter, and edit all your transactions with a powerful data table
- **Dark/Light Mode**: Toggle between themes with persistent preference storage
- **Responsive Design**: Mobile-friendly interface that works on all devices
- **Type-Safe**: Full TypeScript implementation with comprehensive type checking
- **Database-Backed**: PostgreSQL database with Prisma ORM for reliable data storage

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Charts**: Recharts
- **Tables**: Tanstack Table (React Table v8)
- **Validation**: Zod
- **CSV Parsing**: PapaParse
- **Date Handling**: date-fns
- **Theming**: next-themes

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ and npm
- PostgreSQL 14+ (local or remote instance)
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd expense-tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory (or update the existing one):

```env
DATABASE_URL="postgresql://username:password@localhost:5432/expense_tracker"
```

Replace `username`, `password`, and database details with your PostgreSQL credentials.

### 4. Set Up the Database

Create the database (if it doesn't exist):

```bash
# Using psql
psql -U postgres
CREATE DATABASE expense_tracker;
\q
```

Run Prisma migrations to create the database schema:

```bash
npx prisma migrate dev --name init
```

This will:
- Create all necessary tables (Account, Transaction, CSVMapping, Category, ImportHistory)
- Generate the Prisma Client
- Set up indexes for performance

### 5. (Optional) Seed the Database

You can manually add test data or create accounts through the application once it's running.

### 6. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following main models:

### Account
- Stores credit card and bank account information
- Fields: id, name, institution, accountType

### Transaction
- Individual transaction records
- Fields: id, accountId, date, description, amount, category, merchant, originalData (JSON)
- Indexed by: date, accountId, category

### CSVMapping
- Stores field mappings for different CSV formats
- Fields: id, institution (unique), fieldMapping (JSON), dateFormat

### Category
- Hierarchical categories for organizing transactions
- Fields: id, name, parentId (self-referential)

### ImportHistory
- Tracks CSV import operations
- Fields: id, fileName, institution, accountId, rowsImported, importedAt

## CSV Import Formats

The application supports the following CSV formats:

### Fidelity
- Columns: Date, Description, Amount, Balance
- Date Format: MM/DD/YYYY

### Costco Citi
- Columns: Status, Date, Description, Debit, Credit
- Date Format: MM/DD/YYYY

### American Express
- Columns: Date, Description, Card Member, Account #, Amount
- Date Format: MM/DD/YYYY

To add support for additional institutions, update the `defaultMappings` in `lib/csv-parser.ts`.

## Project Structure

```
expense-tracker/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   │   ├── upload/          # CSV upload endpoint
│   │   ├── transactions/    # Transaction CRUD endpoints
│   │   ├── dashboard/       # Dashboard data endpoint
│   │   └── csv-mappings/    # CSV mapping management
│   ├── import/              # CSV import page
│   ├── transactions/        # Transactions list page
│   ├── accounts/            # Accounts page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Dashboard page
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ui/                  # Base UI components (Button, Card, Input, etc.)
│   ├── app-shell.tsx        # Main app layout
│   ├── nav.tsx              # Navigation menu
│   ├── theme-toggle.tsx     # Dark/light mode toggle
│   ├── csv-uploader.tsx     # CSV upload component
│   ├── transactions-table.tsx  # Transaction data table
│   ├── dashboard-charts.tsx    # Dashboard charts
│   └── ...
├── lib/                     # Utility functions and configurations
│   ├── prisma.ts            # Prisma client singleton
│   ├── csv-parser.ts        # CSV parsing logic
│   ├── validations.ts       # Zod validation schemas
│   ├── utils.ts             # Utility functions
│   └── generated/           # Generated Prisma Client
├── prisma/
│   └── schema.prisma        # Database schema
├── types/
│   └── index.ts             # TypeScript type definitions
└── public/                  # Static assets
```

## API Routes

### POST /api/upload
Upload and parse CSV files. Optionally import transactions if accountId is provided.

**Body (FormData):**
- `file`: CSV file
- `institution`: Institution name (fidelity, citi, amex)
- `accountId`: (optional) Account ID to import to

### GET /api/transactions
Fetch transactions with filtering and pagination.

**Query Parameters:**
- `startDate`, `endDate`: Date range filter
- `accountId`: Filter by account
- `category`: Filter by category
- `minAmount`, `maxAmount`: Amount range filter
- `search`: Search in description/merchant
- `page`, `pageSize`: Pagination

### PATCH /api/transactions/[id]
Update a transaction (category, merchant, description).

### DELETE /api/transactions/[id]
Delete a transaction.

### GET /api/dashboard
Get dashboard summary data for a specific month.

**Query Parameters:**
- `month`: (optional) Month to fetch data for (YYYY-MM format)

### GET /api/csv-mappings
List all CSV mappings.

### POST /api/csv-mappings
Create or update a CSV mapping.

## Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Generate Prisma Client
npx prisma generate

# Create a new migration
npx prisma migrate dev --name <migration-name>

# Open Prisma Studio (database GUI)
npx prisma studio
```

## Customization

### Adding New Credit Card Institutions

1. Update `types/index.ts` to add the new institution type
2. Add the CSV mapping to `lib/csv-parser.ts` in the `defaultMappings` object
3. Add the institution option to the select dropdown in `components/csv-uploader.tsx`

### Adding New Categories

Categories can be managed through the Prisma Studio or by creating a categories management page in the application.

### Customizing the Theme

The theme colors are defined in `app/globals.css`. You can modify the CSS variables for both light and dark modes to match your preferred color scheme.

## Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_URL` in `.env` is correct
- Ensure PostgreSQL is running
- Check that the database exists

### Prisma Client Errors
- Run `npx prisma generate` to regenerate the client
- Try deleting `node_modules` and running `npm install` again

### CSV Import Issues
- Verify the CSV format matches the expected format for the institution
- Check the browser console for detailed error messages
- Use the preview feature to validate the CSV before importing

## Future Enhancements

- User authentication and multi-user support
- Budget tracking and alerts
- Recurring transaction detection
- Export functionality (PDF reports, Excel)
- Mobile app
- Receipt image upload and OCR
- Bank account integration via Plaid
- Advanced analytics and insights
- Category auto-categorization with ML

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT License - feel free to use this project for personal or commercial purposes.
