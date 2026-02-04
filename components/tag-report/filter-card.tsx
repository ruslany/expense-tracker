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

const STORAGE_KEY = 'tag-report-filters';

interface Tag {
  id: string;
  name: string;
}

interface FilterCardProps {
  tags: Tag[];
  selectedTagId: string | null;
  startDate: Date | null;
  endDate: Date | null;
}

export function FilterCard({ tags, selectedTagId, startDate, endDate }: FilterCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [tagId, setTagId] = useState(selectedTagId || '');
  const [start, setStart] = useState<Date | undefined>(startDate ?? undefined);
  const [end, setEnd] = useState<Date | undefined>(endDate ?? undefined);

  // On mount, if no params in URL, check localStorage for saved selection
  useEffect(() => {
    const hasTagParam = searchParams.has('tagId');
    const hasStartParam = searchParams.has('startDate');
    const hasEndParam = searchParams.has('endDate');

    if (!hasTagParam && !hasStartParam && !hasEndParam) {
      const savedFilters = localStorage.getItem(STORAGE_KEY);
      if (savedFilters) {
        try {
          const { tagId: savedTagId, startDate: savedStart, endDate: savedEnd } = JSON.parse(savedFilters);
          const params = new URLSearchParams(searchParams);
          let shouldUpdate = false;

          // Validate tag exists in available tags
          if (savedTagId && tags.some((t) => t.id === savedTagId)) {
            params.set('tagId', savedTagId);
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
  }, [searchParams, pathname, router, tags]);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);
    const storageData: { tagId?: string; startDate?: string; endDate?: string } = {};

    if (tagId) {
      params.set('tagId', tagId);
      storageData.tagId = tagId;
    } else {
      params.delete('tagId');
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

    router.replace(`/tags?${params.toString()}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="tag-select">Tag</Label>
            <Select value={tagId} onValueChange={setTagId}>
              <SelectTrigger id="tag-select">
                <SelectValue placeholder="Select a tag" />
              </SelectTrigger>
              <SelectContent>
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id}>
                    {tag.name}
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
