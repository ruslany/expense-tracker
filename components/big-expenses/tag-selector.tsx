'use client';

import { useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

const STORAGE_KEY = 'big-expenses-selected-tag';

interface Tag {
  id: string;
  name: string;
}

interface TagSelectorProps {
  tags: Tag[];
}

export function TagSelector({ tags }: TagSelectorProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const currentTagId = searchParams.get('tagId') || '';

  // On mount, if no tagId in URL, check localStorage for saved selection
  useEffect(() => {
    if (!currentTagId && tags.length > 0) {
      const savedTagId = localStorage.getItem(STORAGE_KEY);
      if (savedTagId) {
        // Verify the saved tag still exists
        const tagExists = tags.some((tag) => tag.id === savedTagId);
        if (tagExists) {
          const params = new URLSearchParams(searchParams);
          params.set('tagId', savedTagId);
          replace(`${pathname}?${params.toString()}`);
        } else {
          // Saved tag no longer exists, clear it
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
  }, [currentTagId, tags, searchParams, pathname, replace]);

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'none') {
      params.set('tagId', value);
      // Save selection to localStorage
      localStorage.setItem(STORAGE_KEY, value);
    } else {
      params.delete('tagId');
      localStorage.removeItem(STORAGE_KEY);
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Select value={currentTagId || 'none'} onValueChange={handleChange}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select a tag" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Select a tag...</SelectItem>
        {tags.map((tag) => (
          <SelectItem key={tag.id} value={tag.id}>
            {tag.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
