import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilterCard } from '@/components/tag-report/filter-card';
import { DateRangeFilter } from '@/components/date-range-filter';
import { SummaryStats } from '@/components/summary-stats';
import { CategoryBreakdownChart } from '@/components/tag-report/category-breakdown-chart';
import { CategoryDetailsTable } from '@/components/tag-report/category-details-table';
import { getPrisma } from '@/lib/prisma';

export async function generateMetadata({ searchParams }: PageProps) {
  const { tagId } = await searchParams;
  if (!tagId) return { title: 'Tag Report' };
  const prisma = await getPrisma();
  const tag = await prisma.tag.findUnique({ where: { id: tagId }, select: { name: true } });
  return { title: tag ? `Tag Report - ${tag.name}` : 'Tag Report' };
}

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ tagId?: string; startDate?: string; endDate?: string }>;
}

async function getAllTags() {
  const prisma = await getPrisma();
  return prisma.tag.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });
}

interface CategoryBreakdown {
  categoryName: string;
  total: number;
  percent: number;
  count: number;
  maxTransaction: number;
}

interface TagReportData {
  tagName: string;
  data: CategoryBreakdown[];
  grandTotal: number;
  totalCount: number;
  overallMaxTransaction: number;
}

async function getTagReport(
  tagId: string,
  startDate: Date | null,
  endDate: Date | null,
): Promise<TagReportData | null> {
  const prisma = await getPrisma();

  const tag = await prisma.tag.findUnique({
    where: { id: tagId },
    select: { name: true },
  });

  if (!tag) return null;

  const dateFilter: Record<string, Date> = {};
  if (startDate) dateFilter.gte = startDate;
  if (endDate) {
    // Include the end date by setting to the next day
    const nextDay = new Date(endDate);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    dateFilter.lt = nextDay;
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      tags: { some: { tagId } },
      ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
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
    tagName: tag.name,
    data,
    grandTotal: Math.round(grandTotal * 100) / 100,
    totalCount,
    overallMaxTransaction: Math.round(overallMaxTransaction * 100) / 100,
  };
}

export default async function TagsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedTagId = params.tagId || null;
  const startDate = params.startDate ? new Date(params.startDate + 'T00:00:00') : null;
  const endDate = params.endDate ? new Date(params.endDate + 'T00:00:00') : null;

  const tags = await getAllTags();
  const report = selectedTagId ? await getTagReport(selectedTagId, startDate, endDate) : null;

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{report ? `Tag Report - ${report.tagName}` : 'Tags'}</h1>
            <p className="text-muted-foreground">Analyze spending by tag with category breakdown</p>
          </div>
          <DateRangeFilter
            key={`dates-${startDate?.toISOString()}-${endDate?.toISOString()}`}
            startDate={startDate ?? undefined}
            endDate={endDate ?? undefined}
            storageKey="tag-report-dates"
            restoreOnMount={false}
          />
        </div>

        <FilterCard key={selectedTagId ?? 'none'} tags={tags} selectedTagId={selectedTagId} />

        {report ? (
          <>
            <SummaryStats
              totalExpenses={report.grandTotal}
              transactionCount={report.totalCount}
              maxTransaction={report.overallMaxTransaction}
            />

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Category Breakdown for &quot;{report.tagName}&quot;</CardTitle>
                </CardHeader>
                <CardContent>
                  <CategoryBreakdownChart data={report.data} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <CategoryDetailsTable
                    data={report.data}
                    grandTotal={report.grandTotal}
                    totalCount={report.totalCount}
                    overallMaxTransaction={report.overallMaxTransaction}
                  />
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Select a tag to view spending analysis by category.
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
