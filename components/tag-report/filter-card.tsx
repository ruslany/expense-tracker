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

  const [tagId, setTagId] = useState(selectedTagId || '');
  const [start, setStart] = useState<Date | undefined>(startDate ?? undefined);
  const [end, setEnd] = useState<Date | undefined>(endDate ?? undefined);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);
    if (tagId) {
      params.set('tagId', tagId);
    } else {
      params.delete('tagId');
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
