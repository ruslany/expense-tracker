'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
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

const STORAGE_KEY = 'spending-trends-filters';

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
  const pathname = usePathname();

  const [groupBy, setGroupBy] = useState(selectedGroupBy);
  const [categoryId, setCategoryId] = useState(selectedCategoryId || 'all');
  const [start, setStart] = useState<Date | undefined>(startDate ?? undefined);
  const [end, setEnd] = useState<Date | undefined>(endDate ?? undefined);

  // Sync state with props when they change (e.g., from URL params)
  useEffect(() => {
    setGroupBy(selectedGroupBy);
  }, [selectedGroupBy]);

  useEffect(() => {
    setCategoryId(selectedCategoryId || 'all');
  }, [selectedCategoryId]);

  useEffect(() => {
    setStart(startDate ?? undefined);
  }, [startDate]);

  useEffect(() => {
    setEnd(endDate ?? undefined);
  }, [endDate]);

  // On mount, if no params in URL, check localStorage for saved selection
  useEffect(() => {
    const hasGroupByParam = searchParams.has('groupBy');
    const hasCategoryParam = searchParams.has('categoryId');
    const hasStartParam = searchParams.has('startDate');
    const hasEndParam = searchParams.has('endDate');

    if (!hasGroupByParam && !hasCategoryParam && !hasStartParam && !hasEndParam) {
      const savedFilters = localStorage.getItem(STORAGE_KEY);
      if (savedFilters) {
        try {
          const { groupBy: savedGroupBy, categoryId: savedCategoryId, startDate: savedStart, endDate: savedEnd } = JSON.parse(savedFilters);
          const params = new URLSearchParams(searchParams);
          let shouldUpdate = false;

          if (savedGroupBy && ['month', 'quarter', 'year'].includes(savedGroupBy)) {
            params.set('groupBy', savedGroupBy);
            shouldUpdate = true;
          }
          if (savedCategoryId && categories.some((c) => c.id === savedCategoryId)) {
            params.set('categoryId', savedCategoryId);
            shouldUpdate = true;
          }
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
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
  }, [searchParams, pathname, router, categories]);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);
    const storageData: { groupBy?: string; categoryId?: string; startDate?: string; endDate?: string } = {};

    params.set('groupBy', groupBy);
    storageData.groupBy = groupBy;

    if (categoryId && categoryId !== 'all') {
      params.set('categoryId', categoryId);
      storageData.categoryId = categoryId;
    } else {
      params.delete('categoryId');
    }
    if (start) {
      const startStr = start.toISOString().split('T')[0];
      params.set('startDate', startStr);
      storageData.startDate = startStr;
    } else {
      params.delete('startDate');
    }
    if (end) {
      const endStr = end.toISOString().split('T')[0];
      params.set('endDate', endStr);
      storageData.endDate = endStr;
    } else {
      params.delete('endDate');
    }

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));

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
