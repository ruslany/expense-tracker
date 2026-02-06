import { AppShell } from '@/components/app-shell';
import { FilterCard } from '@/components/spending-trends/filter-card';
import { DateRangeFilter } from '@/components/date-range-filter';
import { SummaryStats } from '@/components/spending-trends/summary-stats';
import { TrendsChart } from '@/components/spending-trends/trends-chart';
import { getPrisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    groupBy?: string;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

async function getAllCategories() {
  const prisma = await getPrisma();
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });
}

interface TrendDataPoint {
  label: string;
  amount: number;
}

interface TrendsData {
  data: TrendDataPoint[];
  totalSpent: number;
  averagePerPeriod: number;
  highestPeriod: { label: string; amount: number } | null;
  periodsAnalyzed: number;
}

function getQuarter(date: Date): number {
  return Math.floor(date.getUTCMonth() / 3) + 1;
}

function formatPeriodLabel(
  year: number,
  period: number,
  groupBy: 'month' | 'quarter' | 'year',
): string {
  if (groupBy === 'year') {
    return year.toString();
  }
  if (groupBy === 'quarter') {
    return `Q${period} ${year}`;
  }
  // Month
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${monthNames[period - 1]} ${year}`;
}

async function getSpendingTrends(
  groupBy: 'month' | 'quarter' | 'year',
  categoryId: string | null,
  startDate: Date | null,
  endDate: Date | null,
): Promise<TrendsData> {
  const prisma = await getPrisma();

  const dateFilter: Record<string, Date> = {};
  if (startDate) dateFilter.gte = startDate;
  if (endDate) {
    const nextDay = new Date(endDate);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    dateFilter.lt = nextDay;
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
      ...(categoryId ? { categoryId } : {}),
      // Only include expenses (negative amounts)
      amount: { lt: 0 },
    },
    select: { date: true, amount: true },
    orderBy: { date: 'asc' },
  });

  // Group transactions by period
  const periodMap = new Map<string, number>();

  for (const t of transactions) {
    const year = t.date.getUTCFullYear();
    let period: number;
    let key: string;

    if (groupBy === 'year') {
      period = year;
      key = year.toString();
    } else if (groupBy === 'quarter') {
      period = getQuarter(t.date);
      key = `${year}-Q${period}`;
    } else {
      period = t.date.getUTCMonth() + 1;
      key = `${year}-${period.toString().padStart(2, '0')}`;
    }

    const existing = periodMap.get(key) || 0;
    // Negate the amount since expenses are negative
    periodMap.set(key, existing + -t.amount);
  }

  // Convert to sorted array
  const sortedEntries = Array.from(periodMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  const data: TrendDataPoint[] = sortedEntries.map(([key, amount]) => {
    let year: number;
    let period: number;

    if (groupBy === 'year') {
      year = parseInt(key, 10);
      period = year;
    } else if (groupBy === 'quarter') {
      const [y, q] = key.split('-Q');
      year = parseInt(y, 10);
      period = parseInt(q, 10);
    } else {
      const [y, m] = key.split('-');
      year = parseInt(y, 10);
      period = parseInt(m, 10);
    }

    return {
      label: formatPeriodLabel(year, period, groupBy),
      amount: Math.round(amount * 100) / 100,
    };
  });

  const totalSpent = data.reduce((sum, d) => sum + d.amount, 0);
  const periodsAnalyzed = data.length;
  const averagePerPeriod = periodsAnalyzed > 0 ? totalSpent / periodsAnalyzed : 0;

  let highestPeriod: { label: string; amount: number } | null = null;
  if (data.length > 0) {
    const highest = data.reduce((max, d) => (d.amount > max.amount ? d : max), data[0]);
    highestPeriod = { label: highest.label, amount: highest.amount };
  }

  return {
    data,
    totalSpent: Math.round(totalSpent * 100) / 100,
    averagePerPeriod: Math.round(averagePerPeriod * 100) / 100,
    highestPeriod,
    periodsAnalyzed,
  };
}

export default async function TrendsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const groupBy = (params.groupBy as 'month' | 'quarter' | 'year') || 'month';
  const categoryId = params.categoryId || null;
  const startDate = params.startDate ? new Date(params.startDate + 'T00:00:00Z') : null;
  const endDate = params.endDate ? new Date(params.endDate + 'T00:00:00Z') : null;

  const [categories, trends] = await Promise.all([
    getAllCategories(),
    getSpendingTrends(groupBy, categoryId, startDate, endDate),
  ]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Trends</h1>
            <p className="text-muted-foreground">Analyze spending patterns over time</p>
          </div>
          <DateRangeFilter
            key={`dates-${startDate?.toISOString()}-${endDate?.toISOString()}`}
            startDate={startDate ?? undefined}
            endDate={endDate ?? undefined}
          />
        </div>

        <FilterCard
          categories={categories}
          selectedGroupBy={groupBy}
          selectedCategoryId={categoryId}
        />

        <SummaryStats
          totalSpent={trends.totalSpent}
          averagePerPeriod={trends.averagePerPeriod}
          highestPeriod={trends.highestPeriod}
          periodsAnalyzed={trends.periodsAnalyzed}
        />

        <TrendsChart data={trends.data} />
      </div>
    </AppShell>
  );
}
