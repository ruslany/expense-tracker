'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const STORAGE_KEY = 'tag-report-filters';
const DATE_STORAGE_KEY = 'tag-report-dates';

interface Tag {
  id: string;
  name: string;
}

interface FilterCardProps {
  tags: Tag[];
  selectedTagId: string | null;
}

export function FilterCard({ tags, selectedTagId }: FilterCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // On mount, restore tagId and dates from localStorage in a single navigation
  useEffect(() => {
    const hasTag = searchParams.has('tagId');
    const hasDates = searchParams.has('startDate') || searchParams.has('endDate');
    if (hasTag && hasDates) return;

    const params = new URLSearchParams(searchParams);
    let shouldUpdate = false;

    if (!hasTag) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const { tagId: savedTagId } = JSON.parse(saved);
          if (savedTagId && tags.some((t) => t.id === savedTagId)) {
            params.set('tagId', savedTagId);
            shouldUpdate = true;
          }
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    if (!hasDates) {
      try {
        const saved = localStorage.getItem(DATE_STORAGE_KEY);
        if (saved) {
          const { startDate, endDate } = JSON.parse(saved);
          if (startDate) {
            params.set('startDate', startDate);
            shouldUpdate = true;
          }
          if (endDate) {
            params.set('endDate', endDate);
            shouldUpdate = true;
          }
        }
      } catch {
        localStorage.removeItem(DATE_STORAGE_KEY);
      }
    }

    if (shouldUpdate) {
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [searchParams, pathname, router, tags]);

  const handleTagChange = (value: string) => {
    const params = new URLSearchParams(searchParams);

    if (value && value !== 'none') {
      params.set('tagId', value);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tagId: value }));
    } else {
      params.delete('tagId');
      localStorage.removeItem(STORAGE_KEY);
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="tag-select">Tag</Label>
          <Select value={selectedTagId || 'none'} onValueChange={handleTagChange}>
            <SelectTrigger id="tag-select" className="w-full sm:w-60">
              <SelectValue placeholder="Select a tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Select a tag</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag.id} value={tag.id}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
