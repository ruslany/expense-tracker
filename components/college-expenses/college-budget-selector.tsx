'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatInTimeZone } from 'date-fns-tz';

interface Budget {
  id: string;
  label: string;
  academicYearStart: Date;
  academicYearEnd: Date;
}

interface CollegeBudgetSelectorProps {
  budgets: Budget[];
  selectedId: string;
}

export function CollegeBudgetSelector({ budgets, selectedId }: CollegeBudgetSelectorProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('budgetId', value);
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Select value={selectedId} onValueChange={handleChange}>
      <SelectTrigger className="w-full sm:w-64">
        <SelectValue placeholder="Select a budget" />
      </SelectTrigger>
      <SelectContent>
        {budgets.map((budget) => (
          <SelectItem key={budget.id} value={budget.id}>
            {budget.label} ({formatInTimeZone(budget.academicYearStart, 'UTC', 'MMM yyyy')}–
            {formatInTimeZone(budget.academicYearEnd, 'UTC', 'MMM yyyy')})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
