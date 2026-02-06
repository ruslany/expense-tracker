'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface FilterCardProps {
  categories: Category[];
  selectedGroupBy: 'month' | 'quarter' | 'year';
  selectedCategoryId: string | null;
}

export function FilterCard({ categories, selectedGroupBy, selectedCategoryId }: FilterCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleGroupByChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('groupBy', value);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      params.set('categoryId', value);
    } else {
      params.delete('categoryId');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Card>
      <CardContent>
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="group w-full justify-start px-0">
              <span className="text-base font-semibold">Filters</span>
              <ChevronDownIcon className="ml-auto size-4 transition-transform group-data-[state=open]:rotate-180" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2">
                <Label htmlFor="group-by-select">Group By</Label>
                <Select value={selectedGroupBy} onValueChange={handleGroupByChange}>
                  <SelectTrigger id="group-by-select" className="w-full sm:w-45">
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
                <Select value={selectedCategoryId || 'all'} onValueChange={handleCategoryChange}>
                  <SelectTrigger id="category-select" className="w-full sm:w-45">
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
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
