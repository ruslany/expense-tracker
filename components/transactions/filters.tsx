'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

type Category = {
  id: string;
  name: string;
};

type Account = {
  id: string;
  name: string;
};

type Tag = {
  id: string;
  name: string;
};

export function CategoryFilter({ categories }: { categories: Category[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const currentCategoryId = searchParams.get('categoryId') || '';

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1'); // Reset to first page when filtering

    if (value && value !== 'all') {
      params.set('categoryId', value);
    } else {
      params.delete('categoryId');
    }

    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Select value={currentCategoryId || 'all'} onValueChange={handleChange}>
      <SelectTrigger className="w-45">
        <SelectValue placeholder="All Categories" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Categories</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function AccountFilter({ accounts }: { accounts: Account[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const currentAccountId = searchParams.get('accountId') || '';

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1'); // Reset to first page when filtering

    if (value && value !== 'all') {
      params.set('accountId', value);
    } else {
      params.delete('accountId');
    }

    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Select value={currentAccountId || 'all'} onValueChange={handleChange}>
      <SelectTrigger className="w-45">
        <SelectValue placeholder="All Accounts" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Accounts</SelectItem>
        {accounts.map((account) => (
          <SelectItem key={account.id} value={account.id}>
            {account.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function TagFilter({ tags }: { tags: Tag[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const currentTagId = searchParams.get('tagId') || '';

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1'); // Reset to first page when filtering

    if (value && value !== 'all') {
      params.set('tagId', value);
    } else {
      params.delete('tagId');
    }

    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Select value={currentTagId || 'all'} onValueChange={handleChange}>
      <SelectTrigger className="w-45">
        <SelectValue placeholder="All Tags" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Tags</SelectItem>
        {tags.map((tag) => (
          <SelectItem key={tag.id} value={tag.id}>
            {tag.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
