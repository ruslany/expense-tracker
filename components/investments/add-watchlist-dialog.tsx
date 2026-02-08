'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
}

interface AddWatchlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FUND_TYPE_MAP: Record<string, string> = {
  ETF: 'etf',
  'Mutual Fund': 'mutual_fund',
  Fund: 'mutual_fund',
  Equity: 'stock',
  Index: 'etf',
};

function getFundType(typeDisp: string): string {
  return FUND_TYPE_MAP[typeDisp] || 'stock';
}

export function AddWatchlistDialog({ open, onOpenChange }: AddWatchlistDialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setIsSearching(false);
      setIsAdding(null);
    }
  }, [open]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query || query.length < 1) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/watchlist/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
        }
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleAdd = async (result: SearchResult) => {
    setIsAdding(result.symbol);
    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: result.symbol,
          name: result.name,
          fundType: getFundType(result.type),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add to watchlist');
      }

      toast.success(`${result.symbol} added to watchlist`);
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add to watchlist';
      toast.error(message);
    } finally {
      setIsAdding(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Watchlist</DialogTitle>
          <DialogDescription>
            Search for an ETF, mutual fund, or stock to add to your watchlist.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by ticker or name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1">
            {isSearching && (
              <div className="flex items-center justify-center py-4 text-muted-foreground">
                <Loader2 className="size-4 animate-spin mr-2" />
                Searching...
              </div>
            )}

            {!isSearching && results.length === 0 && query.length > 0 && (
              <div className="py-4 text-center text-sm text-muted-foreground">No results found</div>
            )}

            {!isSearching &&
              results.map((result) => (
                <div
                  key={result.symbol}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm">{result.symbol}</div>
                    <div className="text-xs text-muted-foreground truncate">{result.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {result.type} &bull; {result.exchange}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAdd(result)}
                    disabled={isAdding !== null}
                  >
                    {isAdding === result.symbol ? 'Adding...' : 'Add'}
                  </Button>
                </div>
              ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
