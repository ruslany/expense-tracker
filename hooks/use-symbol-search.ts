import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Debounced ticker search against /api/watchlist/search.
 *
 * The search starts from `setQuery` (an event handler) rather than from an effect that
 * watches `query`, so typing does not trigger an extra render. Responses that arrive
 * after a newer query was typed are ignored, so results never belong to an older query.
 */
export function useSymbolSearch<T>(delayMs = 300) {
  const [query, setQueryState] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRequestRef = useRef(0);

  const setQuery = useCallback(
    (value: string) => {
      setQueryState(value);
      if (timerRef.current) clearTimeout(timerRef.current);
      const requestId = ++latestRequestRef.current;

      if (!value) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      timerRef.current = setTimeout(async () => {
        try {
          const response = await fetch(`/api/watchlist/search?q=${encodeURIComponent(value)}`);
          if (response.ok) {
            const data: T[] = await response.json();
            if (requestId === latestRequestRef.current) setResults(data);
          }
        } catch (error) {
          console.error('Search failed:', error);
        } finally {
          if (requestId === latestRequestRef.current) setIsSearching(false);
        }
      }, delayMs);
    },
    [delayMs],
  );

  // Cancel a pending search if the component unmounts.
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  return { query, setQuery, results, isSearching };
}
