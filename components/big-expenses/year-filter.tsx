'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { YEAR_STORAGE_KEY } from './params-initializer';

interface YearFilterProps {
  availableYears: number[];
}

export function YearFilter({ availableYears }: YearFilterProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const currentYear = searchParams.get('year') || new Date().getFullYear().toString();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('year', value);
    localStorage.setItem(YEAR_STORAGE_KEY, value);
    replace(`${pathname}?${params.toString()}`);
  };

  const currentYearNum = parseInt(currentYear, 10);

  const handleYearStep = (direction: -1 | 1) => {
    const year = (currentYearNum + direction).toString();
    const params = new URLSearchParams(searchParams);
    params.set('year', year);
    localStorage.setItem(YEAR_STORAGE_KEY, year);
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleYearStep(-1)}
        disabled={!availableYears.includes(currentYearNum - 1)}
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </Button>

      <Select value={currentYear} onValueChange={handleChange}>
        <SelectTrigger className="w-full sm:w-32">
          <SelectValue placeholder="Select Year" />
        </SelectTrigger>
        <SelectContent>
          {availableYears.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        onClick={() => handleYearStep(1)}
        disabled={!availableYears.includes(currentYearNum + 1)}
      >
        <ChevronRightIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
