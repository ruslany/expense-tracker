'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';

interface Category {
  id: string;
  name: string;
}

interface FilterCardProps {
  categories: Category[];
  selectedGroupBy: 'month' | 'quarter' | 'year';
  selectedCategoryId: string | null;
  startDate: Date | null;
  endDate: Date | null;
}

export function FilterCard({
  categories,
  selectedGroupBy,
  selectedCategoryId,
  startDate,
  endDate,
}: FilterCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [groupBy, setGroupBy] = useState(selectedGroupBy);
  const [categoryId, setCategoryId] = useState(selectedCategoryId || 'all');
  const [start, setStart] = useState<Date | undefined>(startDate ?? undefined);
  const [end, setEnd] = useState<Date | undefined>(endDate ?? undefined);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.set('groupBy', groupBy);
    if (categoryId && categoryId !== 'all') {
      params.set('categoryId', categoryId);
    } else {
      params.delete('categoryId');
    }
    if (start) {
      params.set('startDate', start.toISOString().split('T')[0]);
    } else {
      params.delete('startDate');
    }
    if (end) {
      params.set('endDate', end.toISOString().split('T')[0]);
    } else {
      params.delete('endDate');
    }
    router.replace(`/trends?${params.toString()}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-2">
            <Label htmlFor="group-by-select">Group By</Label>
            <Select value={groupBy} onValueChange={(v) => setGroupBy(v as 'month' | 'quarter' | 'year')}>
              <SelectTrigger id="group-by-select">
                <SelectValue placeholder="Select grouping" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Months</SelectItem>
                <SelectItem value="quarter">Quarters</SelectItem>
                <SelectItem value="year">Years</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category-select">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="category-select">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Start Date</Label>
            <DatePicker date={start} onDateChange={setStart} placeholder="Start date" />
          </div>
          <div className="space-y-2">
            <Label>End Date</Label>
            <DatePicker date={end} onDateChange={setEnd} placeholder="End date" />
          </div>
          <div className="flex items-end">
            <Button onClick={applyFilters} className="w-full">
              Apply Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
