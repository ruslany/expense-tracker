import type { Metadata } from 'next';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CollegeBudgetSelector } from '@/components/college-expenses/college-budget-selector';
import { AcademicYearSummary } from '@/components/college-expenses/academic-year-summary';
import { MonthlyReconciliationTable } from '@/components/college-expenses/monthly-reconciliation-table';
import { CalendarYearRollupTable } from '@/components/college-expenses/calendar-year-rollup-table';
import { fetchCollegeBudgets } from '@/lib/data';
import { getPrisma } from '@/lib/prisma';

export const metadata: Metadata = { title: 'College Expenses' };
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ budgetId?: string }>;
}

interface Leg {
  id: string;
  date: Date;
  amount: number;
  receiptCount: number;
}

interface MonthlyRow {
  monthKey: string;
  expenseTotal: number;
  expenseReceiptCount: number;
  reimbursement: { date: Date; amount: number; receiptCount: number } | null;
  matched: boolean;
  note: string | null;
}

interface CalendarYearRow {
  year: number;
  expenseTotal: number;
  reimbursementTotal: number;
}

async function getCollegeExpenseReport(budget: {
  academicYearStart: Date;
  academicYearEnd: Date;
  tagId: string;
  limitAmount: number;
}) {
  const prisma = await getPrisma();
  const rangeEnd = new Date(budget.academicYearEnd);
  rangeEnd.setUTCDate(rangeEnd.getUTCDate() + 1);

  const transactions = await prisma.transaction.findMany({
    where: {
      date: { gte: budget.academicYearStart, lt: rangeEnd },
      OR: [
        {
          parentId: null,
          NOT: { splits: { some: {} } },
          tags: { some: { tagId: budget.tagId } },
        },
        {
          parentId: { not: null },
          parent: { tags: { some: { tagId: budget.tagId } } },
        },
      ],
    },
    include: {
      _count: { select: { receipts: true } },
    },
    orderBy: { date: 'asc' },
  });

  const expenseLegs: Leg[] = [];
  const reimbursementLegs: Leg[] = [];
  for (const t of transactions) {
    const leg: Leg = { id: t.id, date: t.date, amount: t.amount, receiptCount: t._count.receipts };
    if (t.amount < 0) {
      expenseLegs.push(leg);
    } else if (t.amount > 0) {
      reimbursementLegs.push(leg);
    }
  }

  const totalExpense = expenseLegs.reduce((sum, l) => sum + Math.abs(l.amount), 0);
  const totalReimbursement = reimbursementLegs.reduce((sum, l) => sum + l.amount, 0);

  // Group expense legs by calendar month, since a single monthly 529 transfer
  // may reimburse more than one debit (e.g. rent + groceries) in that month.
  const monthGroups = new Map<string, { total: number; receiptCount: number; date: Date }>();
  for (const leg of expenseLegs) {
    const monthKey = `${leg.date.getUTCFullYear()}-${String(leg.date.getUTCMonth() + 1).padStart(2, '0')}`;
    const existing = monthGroups.get(monthKey);
    if (existing) {
      existing.total += Math.abs(leg.amount);
      existing.receiptCount += leg.receiptCount;
    } else {
      monthGroups.set(monthKey, {
        total: Math.abs(leg.amount),
        receiptCount: leg.receiptCount,
        date: leg.date,
      });
    }
  }

  const usedReimbursementIds = new Set<string>();
  const monthlyRows: MonthlyRow[] = Array.from(monthGroups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, group]) => {
      // Match against an unused reimbursement of (nearly) the same amount,
      // preferring the one closest in time to the expense.
      const candidates = reimbursementLegs
        .filter((r) => !usedReimbursementIds.has(r.id) && Math.abs(r.amount - group.total) <= 0.01)
        .sort(
          (a, b) =>
            Math.abs(a.date.getTime() - group.date.getTime()) -
            Math.abs(b.date.getTime() - group.date.getTime()),
        );
      const match = candidates[0];
      if (match) {
        usedReimbursementIds.add(match.id);
      }

      return {
        monthKey,
        expenseTotal: group.total,
        expenseReceiptCount: group.receiptCount,
        reimbursement: match
          ? { date: match.date, amount: match.amount, receiptCount: match.receiptCount }
          : null,
        matched: !!match,
        note: match ? null : 'No matching reimbursement found',
      };
    });

  for (const leftover of reimbursementLegs) {
    if (!usedReimbursementIds.has(leftover.id)) {
      const monthKey = `${leftover.date.getUTCFullYear()}-${String(leftover.date.getUTCMonth() + 1).padStart(2, '0')}`;
      monthlyRows.push({
        monthKey,
        expenseTotal: 0,
        expenseReceiptCount: 0,
        reimbursement: {
          date: leftover.date,
          amount: leftover.amount,
          receiptCount: leftover.receiptCount,
        },
        matched: false,
        note: 'Unexplained transfer (no matching expense)',
      });
    }
  }
  monthlyRows.sort((a, b) => a.monthKey.localeCompare(b.monthKey));

  // Calendar-year rollup: the academic year (Sept-May) always spans two
  // calendar years, and 1099-Q reporting is calendar-year based, so this is
  // an informational split of the same totals, not a mismatch detector.
  const yearMap = new Map<number, { expenseTotal: number; reimbursementTotal: number }>();
  for (const leg of expenseLegs) {
    const year = leg.date.getUTCFullYear();
    const entry = yearMap.get(year) ?? { expenseTotal: 0, reimbursementTotal: 0 };
    entry.expenseTotal += Math.abs(leg.amount);
    yearMap.set(year, entry);
  }
  for (const leg of reimbursementLegs) {
    const year = leg.date.getUTCFullYear();
    const entry = yearMap.get(year) ?? { expenseTotal: 0, reimbursementTotal: 0 };
    entry.reimbursementTotal += leg.amount;
    yearMap.set(year, entry);
  }
  const calendarYearRows: CalendarYearRow[] = Array.from(yearMap.entries())
    .map(([year, totals]) => ({ year, ...totals }))
    .sort((a, b) => a.year - b.year);

  return {
    totalExpense: Math.round(totalExpense * 100) / 100,
    totalReimbursement: Math.round(totalReimbursement * 100) / 100,
    monthlyRows,
    calendarYearRows,
  };
}

export default async function CollegeExpensesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const budgets = await fetchCollegeBudgets();

  if (budgets.length === 0) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">College Expenses</h1>
            <p className="text-muted-foreground">
              Track spend against a school&apos;s cost-of-attendance limit
            </p>
          </div>
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground space-y-4">
              <p>No college budgets have been set up yet.</p>
              <Button asChild>
                <Link href="/administration">Create a college budget</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  const today = new Date();
  const selectedBudget =
    budgets.find((b) => b.id === params.budgetId) ??
    budgets.find((b) => b.academicYearStart <= today && today <= b.academicYearEnd) ??
    budgets[0];

  const report = await getCollegeExpenseReport(selectedBudget);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">College Expenses</h1>
            <p className="text-muted-foreground">
              Track spend against a school&apos;s cost-of-attendance limit
            </p>
          </div>
          <CollegeBudgetSelector budgets={budgets} selectedId={selectedBudget.id} />
        </div>

        <AcademicYearSummary
          limitAmount={selectedBudget.limitAmount}
          totalExpense={report.totalExpense}
          totalReimbursement={report.totalReimbursement}
        />

        <MonthlyReconciliationTable rows={report.monthlyRows} tagId={selectedBudget.tagId} />

        <CalendarYearRollupTable rows={report.calendarYearRows} />
      </div>
    </AppShell>
  );
}
