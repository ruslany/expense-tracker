'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

  return (
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
  );
}
