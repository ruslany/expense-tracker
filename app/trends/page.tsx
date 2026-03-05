import type { Metadata } from 'next';
import { AppShell } from '@/components/app-shell';
import { FilterCard } from '@/components/spending-trends/filter-card';
import { DateRangeFilter } from '@/components/date-range-filter';
import { SummaryStats } from '@/components/spending-trends/summary-stats';
import { TrendsChart } from '@/components/spending-trends/trends-chart';
import { getPrisma } from '@/lib/prisma';
import { fetchTags } from '@/lib/data';

export const metadata: Metadata = { title: 'Spending Trends' };
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    groupBy?: string;
    categoryId?: string;
    tagId?: string;
    startDate?: string;
    endDate?: string;
    view?: string;
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
  lowestPeriod: { label: string; amount: number } | null;
}

export interface EssentialDataPoint {
  label: string;
  essential: number;
  discretionary: number;
}

interface EssentialTrendsData {
  data: EssentialDataPoint[];
  totalSpent: number;
  averagePerPeriod: number;
  highestPeriod: { label: string; amount: number } | null;
  lowestPeriod: { label: string; amount: number } | null;
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
  tagId: string | null,
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
      ...(tagId ? { tags: { some: { tagId } } } : {}),
      // Include expenses (negative amounts) and refunds (positive amounts)
      // so that refunds reduce the period total
      amount: { not: 0 },
      NOT: { splits: { some: {} } },
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
  let lowestPeriod: { label: string; amount: number } | null = null;
  if (data.length > 0) {
    const highest = data.reduce((max, d) => (d.amount > max.amount ? d : max), data[0]);
    highestPeriod = { label: highest.label, amount: highest.amount };

    // Exclude the current (incomplete) period from lowest calculation
    const now = new Date();
    const currentYear = now.getUTCFullYear();
    let currentPeriod: number;
    if (groupBy === 'year') {
      currentPeriod = currentYear;
    } else if (groupBy === 'quarter') {
      currentPeriod = getQuarter(now);
    } else {
      currentPeriod = now.getUTCMonth() + 1;
    }
    const currentPeriodLabel = formatPeriodLabel(currentYear, currentPeriod, groupBy);
    const completedPeriods = data.filter((d) => d.label !== currentPeriodLabel);

    if (completedPeriods.length > 0) {
      const lowest = completedPeriods.reduce(
        (min, d) => (d.amount < min.amount ? d : min),
        completedPeriods[0],
      );
      lowestPeriod = { label: lowest.label, amount: lowest.amount };
    }
  }

  return {
    data,
    totalSpent: Math.round(totalSpent * 100) / 100,
    averagePerPeriod: Math.round(averagePerPeriod * 100) / 100,
    highestPeriod,
    lowestPeriod,
  };
}

async function getEssentialTrends(
  groupBy: 'month' | 'quarter' | 'year',
  startDate: Date | null,
  endDate: Date | null,
): Promise<EssentialTrendsData> {
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
      amount: { not: 0 },
      NOT: { splits: { some: {} } },
    },
    select: {
      date: true,
      amount: true,
      category: { select: { isEssential: true } },
    },
    orderBy: { date: 'asc' },
  });

  // Group transactions by period, split into essential and discretionary
  const essentialMap = new Map<string, number>();
  const discretionaryMap = new Map<string, number>();

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

    const negatedAmount = -t.amount;
    if (t.category?.isEssential) {
      essentialMap.set(key, (essentialMap.get(key) ?? 0) + negatedAmount);
    } else {
      discretionaryMap.set(key, (discretionaryMap.get(key) ?? 0) + negatedAmount);
    }
  }

  // Collect all period keys
  const allKeys = new Set([...essentialMap.keys(), ...discretionaryMap.keys()]);
  const sortedEntries = Array.from(allKeys).sort((a, b) => a.localeCompare(b));

  const data: EssentialDataPoint[] = sortedEntries.map((key) => {
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

    const essential = Math.round((essentialMap.get(key) ?? 0) * 100) / 100;
    const discretionary = Math.round((discretionaryMap.get(key) ?? 0) * 100) / 100;

    return { label: formatPeriodLabel(year, period, groupBy), essential, discretionary };
  });

  const totals = data.map((d) => d.essential + d.discretionary);
  const totalSpent = totals.reduce((sum, v) => sum + v, 0);
  const periodsAnalyzed = data.length;
  const averagePerPeriod = periodsAnalyzed > 0 ? totalSpent / periodsAnalyzed : 0;

  let highestPeriod: { label: string; amount: number } | null = null;
  let lowestPeriod: { label: string; amount: number } | null = null;
  if (data.length > 0) {
    const withTotals = data.map((d, i) => ({ label: d.label, amount: totals[i] }));
    const highest = withTotals.reduce((max, d) => (d.amount > max.amount ? d : max), withTotals[0]);
    highestPeriod = { label: highest.label, amount: highest.amount };

    const now = new Date();
    const currentYear = now.getUTCFullYear();
    let currentPeriod: number;
    if (groupBy === 'year') {
      currentPeriod = currentYear;
    } else if (groupBy === 'quarter') {
      currentPeriod = getQuarter(now);
    } else {
      currentPeriod = now.getUTCMonth() + 1;
    }
    const currentPeriodLabel = formatPeriodLabel(currentYear, currentPeriod, groupBy);
    const completedPeriods = withTotals.filter((d) => d.label !== currentPeriodLabel);

    if (completedPeriods.length > 0) {
      const lowest = completedPeriods.reduce(
        (min, d) => (d.amount < min.amount ? d : min),
        completedPeriods[0],
      );
      lowestPeriod = { label: lowest.label, amount: lowest.amount };
    }
  }

  return {
    data,
    totalSpent: Math.round(totalSpent * 100) / 100,
    averagePerPeriod: Math.round(averagePerPeriod * 100) / 100,
    highestPeriod,
    lowestPeriod,
  };
}

export default async function TrendsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const groupBy = (params.groupBy as 'month' | 'quarter' | 'year') || 'month';
  const view = params.view === 'essential' ? 'essential' : 'default';
  const categoryId = view === 'essential' ? null : params.categoryId || null;
  const tagId = params.tagId || null;
  const defaultStartDate = new Date();
  defaultStartDate.setUTCFullYear(defaultStartDate.getUTCFullYear() - 2);
  defaultStartDate.setUTCDate(1);
  if (groupBy === 'quarter') {
    const month = defaultStartDate.getUTCMonth(); // 0-11
    const quarterStartMonth = month - (month % 3);
    defaultStartDate.setUTCMonth(quarterStartMonth, 1);
  } else if (groupBy === 'year') {
    defaultStartDate.setUTCMonth(0, 1);
  }
  const startDate = params.startDate ? new Date(params.startDate) : defaultStartDate;
  const endDate = params.endDate ? new Date(params.endDate) : null;

  const [categories, tags, trends] = await Promise.all([
    getAllCategories(),
    fetchTags(),
    view === 'essential'
      ? getEssentialTrends(groupBy, startDate, endDate)
      : getSpendingTrends(groupBy, categoryId, tagId, startDate, endDate),
  ]);

  const monthlyBudget = process.env.MONTHLY_BUDGET ? Number(process.env.MONTHLY_BUDGET) : null;

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
          tags={tags}
          selectedGroupBy={groupBy}
          selectedCategoryId={categoryId}
          selectedTagId={tagId}
          selectedView={view}
        />

        <SummaryStats
          totalSpent={trends.totalSpent}
          averagePerPeriod={trends.averagePerPeriod}
          highestPeriod={trends.highestPeriod}
          lowestPeriod={trends.lowestPeriod}
        />

        {view === 'essential' ? (
          <TrendsChart
            view="essential"
            data={(trends as EssentialTrendsData).data}
            groupBy={groupBy}
          />
        ) : (
          <TrendsChart
            view="default"
            data={(trends as TrendsData).data}
            groupBy={groupBy}
            monthlyBudget={monthlyBudget}
          />
        )}
      </div>
    </AppShell>
  );
}
