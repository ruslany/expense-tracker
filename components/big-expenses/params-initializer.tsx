'use client';

import { useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export const YEAR_STORAGE_KEY = 'big-expenses-selected-year';
export const TAG_STORAGE_KEY = 'big-expenses-selected-tag';

interface ParamsInitializerProps {
  availableYears: number[];
  availableTagIds: string[];
}

export function ParamsInitializer({ availableYears, availableTagIds }: ParamsInitializerProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  useEffect(() => {
    const hasYear = searchParams.has('year');
    const hasTag = searchParams.has('tagId');

    if (hasYear && hasTag) return;

    const params = new URLSearchParams(searchParams);
    let shouldUpdate = false;

    // Check for saved year
    if (!hasYear) {
      const savedYear = localStorage.getItem(YEAR_STORAGE_KEY);
      if (savedYear && availableYears.some((y) => y.toString() === savedYear)) {
        params.set('year', savedYear);
        shouldUpdate = true;
      }
    }

    // Check for saved tag
    if (!hasTag) {
      const savedTag = localStorage.getItem(TAG_STORAGE_KEY);
      if (savedTag && availableTagIds.includes(savedTag)) {
        params.set('tagId', savedTag);
        shouldUpdate = true;
      }
    }

    if (shouldUpdate) {
      replace(`${pathname}?${params.toString()}`);
    }
  }, [searchParams, pathname, replace, availableYears, availableTagIds]);

  return null;
}
