'use client';

import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function SearchTransactions({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [value, setValue] = useState(searchParams.get('query')?.toString() || '');

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1'); // Reset to first page when searching

    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }

    replace(`${pathname}?${params.toString()}`);
  }, 300);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    handleSearch(newValue);
  };

  const handleClear = () => {
    setValue('');
    handleSearch('');
  };

  return (
    <div className="relative max-w-sm">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        type="text"
        placeholder={placeholder}
        onChange={handleChange}
        value={value}
        className="pl-10 pr-10"
      />
      {value && (
        <Button
          onClick={handleClear}
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          type="button"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
