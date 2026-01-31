'use client';

import { useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

const STORAGE_KEY = 'dashboard-period';

interface DashboardPeriodFilterProps {
  availableYears: number[];
}

const MONTHS = [
  { value: '0', label: 'January' },
  { value: '1', label: 'February' },
  { value: '2', label: 'March' },
  { value: '3', label: 'April' },
  { value: '4', label: 'May' },
  { value: '5', label: 'June' },
  { value: '6', label: 'July' },
  { value: '7', label: 'August' },
  { value: '8', label: 'September' },
  { value: '9', label: 'October' },
  { value: '10', label: 'November' },
  { value: '11', label: 'December' },
];

export function DashboardPeriodFilter({ availableYears }: DashboardPeriodFilterProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const now = new Date();
  const currentYear = searchParams.get('year') || now.getFullYear().toString();
  const currentMonth = searchParams.get('month') || now.getMonth().toString();

  // On mount, if no params in URL, check localStorage for saved selection
  useEffect(() => {
    const hasYearParam = searchParams.has('year');
    const hasMonthParam = searchParams.has('month');

    if (!hasYearParam || !hasMonthParam) {
      const savedPeriod = localStorage.getItem(STORAGE_KEY);
      if (savedPeriod) {
        try {
          const { year, month } = JSON.parse(savedPeriod);
          const params = new URLSearchParams(searchParams);

          // Validate year exists in available years
          if (!hasYearParam && year && availableYears.includes(parseInt(year, 10))) {
            params.set('year', year);
          }
          // Validate month is valid (0-11)
          if (!hasMonthParam && month !== undefined) {
            const monthNum = parseInt(month, 10);
            if (monthNum >= 0 && monthNum <= 11) {
              params.set('month', month);
            }
          }

          if (params.toString() !== searchParams.toString()) {
            replace(`${pathname}?${params.toString()}`);
          }
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
  }, [searchParams, pathname, replace, availableYears]);

  const handleYearChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('year', value);
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ year: value, month: currentMonth }));
    replace(`${pathname}?${params.toString()}`);
  };

  const handleMonthChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('month', value);
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ year: currentYear, month: value }));
    replace(`${pathname}?${params.toString()}`);
  };

  const selectedMonthLabel = MONTHS.find((m) => m.value === currentMonth)?.label || 'Month';

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Select value={currentMonth} onValueChange={handleMonthChange}>
        <SelectTrigger className="w-full sm:w-36">
          <SelectValue placeholder="Month">{selectedMonthLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((month) => (
            <SelectItem key={month.value} value={month.value}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentYear} onValueChange={handleYearChange}>
        <SelectTrigger className="w-full sm:w-24">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {availableYears.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
