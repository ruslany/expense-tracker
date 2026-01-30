import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { YearFilter } from '@/components/big-expenses/year-filter';
import { TagSelector } from '@/components/big-expenses/tag-selector';
import { ParamsInitializer } from '@/components/big-expenses/params-initializer';
import { BigExpenseTagsManager } from '@/components/big-expenses/big-expense-tags-manager';
import { ExpensesByTagChart } from '@/components/big-expenses/expenses-by-tag-chart';
import { ExpensesByTagTable } from '@/components/big-expenses/expenses-by-tag-table';
import { CategoriesForTagTable } from '@/components/big-expenses/categories-for-tag-table';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ year?: string; tagId?: string }>;
}

async function getAvailableYears() {
  const result = await prisma.transaction.findMany({
    select: { date: true },
    distinct: ['date'],
  });

  const years = new Set<number>();
  for (const t of result) {
    years.add(t.date.getUTCFullYear());
  }

  const yearsArray = Array.from(years).sort((a, b) => b - a);
  if (yearsArray.length === 0) {
    yearsArray.push(new Date().getFullYear());
  }
  return yearsArray;
}

async function getAllTags() {
  return prisma.tag.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, isBigExpense: true },
  });
}

interface TagExpense {
  tagId: string;
  tagName: string;
  total: number;
  maxTransaction: number;
  percent: number;
}

async function getExpensesByBigExpenseTags(year: number): Promise<{
  data: TagExpense[];
  grandTotal: number;
  overallMaxTransaction: number;
}> {
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const yearEnd = new Date(Date.UTC(year + 1, 0, 1));

  // Include all transactions (expenses and refunds) to get net amounts
  const transactions = await prisma.transaction.findMany({
    where: {
      date: { gte: yearStart, lt: yearEnd },
      tags: {
        some: {
          tag: { isBigExpense: true },
        },
      },
    },
    include: {
      tags: {
        include: { tag: true },
        where: { tag: { isBigExpense: true } },
      },
    },
  });

  const tagMap = new Map<string, { name: string; total: number; maxTransaction: number }>();

  for (const t of transactions) {
    for (const tt of t.tags) {
      const existing = tagMap.get(tt.tagId);
      // Negate amount: expenses (-) become positive, refunds (+) become negative (deductions)
      const netAmount = -t.amount;
      const absAmount = Math.abs(t.amount);
      if (existing) {
        existing.total += netAmount;
        existing.maxTransaction = Math.max(existing.maxTransaction, absAmount);
      } else {
        tagMap.set(tt.tagId, {
          name: tt.tag.name,
          total: netAmount,
          maxTransaction: absAmount,
        });
      }
    }
  }

  const grandTotal = Array.from(tagMap.values()).reduce((sum, t) => sum + t.total, 0);
  const overallMaxTransaction = Math.max(
    ...Array.from(tagMap.values()).map((t) => t.maxTransaction),
    0,
  );

  const data: TagExpense[] = Array.from(tagMap.entries())
    .map(([tagId, stats]) => ({
      tagId,
      tagName: stats.name,
      total: stats.total,
      maxTransaction: stats.maxTransaction,
      percent: grandTotal > 0 ? (stats.total / grandTotal) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return {
    data,
    grandTotal: Math.round(grandTotal * 100) / 100,
    overallMaxTransaction: Math.round(overallMaxTransaction * 100) / 100,
  };
}

interface CategoryBreakdown {
  categoryName: string;
  total: number;
  percent: number;
  count: number;
  maxTransaction: number;
}

async function getCategoriesForTag(
  tagId: string,
  year: number,
): Promise<{
  data: CategoryBreakdown[];
  grandTotal: number;
  totalCount: number;
  overallMaxTransaction: number;
}> {
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const yearEnd = new Date(Date.UTC(year + 1, 0, 1));

  // Include all transactions (expenses and refunds) to get net amounts
  const transactions = await prisma.transaction.findMany({
    where: {
      date: { gte: yearStart, lt: yearEnd },
      tags: { some: { tagId } },
    },
    include: { category: true },
  });

  const categoryMap = new Map<string, { total: number; count: number; maxTransaction: number }>();

  for (const t of transactions) {
    const categoryName = t.category?.name ?? 'Uncategorized';
    // Negate amount: expenses (-) become positive, refunds (+) become negative (deductions)
    const netAmount = -t.amount;
    const absAmount = Math.abs(t.amount);
    const existing = categoryMap.get(categoryName);
    if (existing) {
      existing.total += netAmount;
      existing.count += 1;
      existing.maxTransaction = Math.max(existing.maxTransaction, absAmount);
    } else {
      categoryMap.set(categoryName, {
        total: netAmount,
        count: 1,
        maxTransaction: absAmount,
      });
    }
  }

  const grandTotal = Array.from(categoryMap.values()).reduce((sum, c) => sum + c.total, 0);
  const totalCount = Array.from(categoryMap.values()).reduce((sum, c) => sum + c.count, 0);
  const overallMaxTransaction = Math.max(
    ...Array.from(categoryMap.values()).map((c) => c.maxTransaction),
    0,
  );

  const data: CategoryBreakdown[] = Array.from(categoryMap.entries())
    .map(([categoryName, stats]) => ({
      categoryName,
      total: Math.round(stats.total * 100) / 100,
      percent: grandTotal > 0 ? (stats.total / grandTotal) * 100 : 0,
      count: stats.count,
      maxTransaction: Math.round(stats.maxTransaction * 100) / 100,
    }))
    .sort((a, b) => b.total - a.total);

  return {
    data,
    grandTotal: Math.round(grandTotal * 100) / 100,
    totalCount,
    overallMaxTransaction: Math.round(overallMaxTransaction * 100) / 100,
  };
}

export default async function BigExpensesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentYear = params.year ? parseInt(params.year, 10) : new Date().getFullYear();
  const selectedTagId = params.tagId || null;

  const [availableYears, allTags, expensesByTag] = await Promise.all([
    getAvailableYears(),
    getAllTags(),
    getExpensesByBigExpenseTags(currentYear),
  ]);

  const categoriesForTag = selectedTagId
    ? await getCategoriesForTag(selectedTagId, currentYear)
    : null;

  const selectedTag = selectedTagId ? allTags.find((t) => t.id === selectedTagId) : null;

  return (
    <AppShell>
      <ParamsInitializer
        availableYears={availableYears}
        availableTagIds={allTags.map((t) => t.id)}
      />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Big Expenses</h1>
            <p className="text-muted-foreground">Track yearly expenses by tag</p>
          </div>
          <YearFilter availableYears={availableYears} />
        </div>

        <BigExpenseTagsManager tags={allTags} />

        <Card>
          <CardHeader>
            <CardTitle>Expenses by Tag ({currentYear})</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpensesByTagChart data={expensesByTag.data} />
            <div className="mt-6">
              <ExpensesByTagTable
                data={expensesByTag.data}
                grandTotal={expensesByTag.grandTotal}
                overallMaxTransaction={expensesByTag.overallMaxTransaction}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Category Breakdown for Tag</CardTitle>
              <TagSelector tags={allTags} />
            </div>
          </CardHeader>
          <CardContent>
            {selectedTagId && categoriesForTag ? (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Showing categories for tag: <strong>{selectedTag?.name}</strong> in {currentYear}
                </p>
                <CategoriesForTagTable
                  data={categoriesForTag.data}
                  grandTotal={categoriesForTag.grandTotal}
                  totalCount={categoriesForTag.totalCount}
                  overallMaxTransaction={categoriesForTag.overallMaxTransaction}
                />
              </>
            ) : (
              <p className="text-muted-foreground text-sm italic py-4">
                Select a tag to view category breakdown.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
