'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { format } from 'date-fns';
import { CalendarIcon, PlayIcon, XIcon } from 'lucide-react';
import { type DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
                  {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
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
