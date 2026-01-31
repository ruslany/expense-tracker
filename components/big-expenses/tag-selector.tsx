'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { TAG_STORAGE_KEY } from './params-initializer';

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

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'none') {
      params.set('tagId', value);
      localStorage.setItem(TAG_STORAGE_KEY, value);
    } else {
      params.delete('tagId');
      localStorage.removeItem(TAG_STORAGE_KEY);
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Select value={currentTagId || 'none'} onValueChange={handleChange}>
      <SelectTrigger className="w-full sm:w-48">
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
