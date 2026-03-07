'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VALID_PAGE_SIZES } from '@/lib/constants';

export function SettingsTab({ currentPageSize }: { currentPageSize: number }) {
  const [pageSize, setPageSize] = useState(String(currentPageSize));

  async function handlePageSizeChange(value: string) {
    setPageSize(value);
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageSize: Number(value) }),
    });

    if (res.ok) {
      toast.success('Page size saved');
    } else {
      toast.error('Failed to save setting');
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="page-size-select">Transactions page size</Label>
          <p className="text-sm text-muted-foreground">
            Number of transactions shown per page in the transactions list.
          </p>
          <Select value={pageSize} onValueChange={handlePageSizeChange}>
            <SelectTrigger id="page-size-select" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VALID_PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
