'use client';

import { useState, useEffect } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
} from 'date-fns';
import { CalendarIcon, PlayIcon, XIcon } from 'lucide-react';
import { type DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DateRangeFilterProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  storageKey?: string;
  restoreOnMount?: boolean;
}

export function DateRangeFilter({
  startDate,
  endDate,
  storageKey,
  restoreOnMount = true,
}: DateRangeFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [date, setDate] = useState<DateRange | undefined>(
    startDate || endDate ? { from: startDate, to: endDate } : undefined,
  );

  // On mount, if no date params in URL and storageKey is set, restore from localStorage
  useEffect(() => {
    if (
      !storageKey ||
      !restoreOnMount ||
      searchParams.has('startDate') ||
      searchParams.has('endDate')
    )
      return;

    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const { startDate: savedStart, endDate: savedEnd } = JSON.parse(saved);
        const params = new URLSearchParams(searchParams);
        let shouldUpdate = false;

        if (savedStart) {
          params.set('startDate', savedStart);
          shouldUpdate = true;
        }
        if (savedEnd) {
          params.set('endDate', savedEnd);
          shouldUpdate = true;
        }

        if (shouldUpdate) {
          router.replace(`${pathname}?${params.toString()}`);
        }
      } catch {
        localStorage.removeItem(storageKey);
      }
    }
  }, [storageKey, restoreOnMount, searchParams, pathname, router]);

  const applyPreset = (preset: string) => {
    const now = new Date();
    let from: Date;
    let to: Date;

    switch (preset) {
      case 'current-month':
        from = startOfMonth(now);
        to = endOfMonth(now);
        break;
      case 'last-month': {
        const lastMonth = subMonths(now, 1);
        from = startOfMonth(lastMonth);
        to = endOfMonth(lastMonth);
        break;
      }
      case 'current-year':
        from = startOfYear(now);
        to = endOfYear(now);
        break;
      default: {
        // Handle dynamic year presets like "year-2025"
        const yearMatch = preset.match(/^year-(\d{4})$/);
        if (!yearMatch) return;
        const yearDate = new Date(parseInt(yearMatch[1], 10), 0, 1);
        from = startOfYear(yearDate);
        to = endOfYear(yearDate);
        break;
      }
    }

    setDate({ from, to });

    const params = new URLSearchParams(searchParams);
    const startStr = format(from, 'yyyy-MM-dd');
    const endStr = format(to, 'yyyy-MM-dd');
    params.set('startDate', startStr);
    params.set('endDate', endStr);

    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify({ startDate: startStr, endDate: endStr }));
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

  const applyDateRange = () => {
    const params = new URLSearchParams(searchParams);
    const storageData: { startDate?: string; endDate?: string } = {};

    if (date?.from) {
      const startStr = format(date.from, 'yyyy-MM-dd');
      params.set('startDate', startStr);
      storageData.startDate = startStr;
    } else {
      params.delete('startDate');
    }

    if (date?.to) {
      const endStr = format(date.to, 'yyyy-MM-dd');
      params.set('endDate', endStr);
      storageData.endDate = endStr;
    } else {
      params.delete('endDate');
    }

    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(storageData));
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

  const resetDateRange = () => {
    setDate(undefined);

    const params = new URLSearchParams(searchParams);
    params.delete('startDate');
    params.delete('endDate');

    if (storageKey) {
      localStorage.removeItem(storageKey);
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-end gap-2">
      <Select onValueChange={applyPreset}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Presets" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="current-month">Current month</SelectItem>
          <SelectItem value="last-month">Last month</SelectItem>
          <SelectItem value="current-year">Current year</SelectItem>
          {Array.from({ length: new Date().getFullYear() - 2024 }, (_, i) => {
            const year = new Date().getFullYear() - 1 - i;
            return (
              <SelectItem key={year} value={`year-${year}`}>
                {year}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn('justify-start px-2.5 font-normal', !date && 'text-muted-foreground')}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {formatInTimeZone(date.from, 'UTC', 'LLL dd, y')} -{' '}
                  {formatInTimeZone(date.to, 'UTC', 'LLL dd, y')}
                </>
              ) : (
                formatInTimeZone(date.from, 'UTC', 'LLL dd, y')
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="outline" onClick={applyDateRange}>
              <PlayIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Apply date range</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="outline" onClick={resetDateRange}>
              <XIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reset date range</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
