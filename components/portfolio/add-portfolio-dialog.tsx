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
import { Label } from '@/components/ui/label';

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
}

interface AddPortfolioDialogProps {
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

export function AddPortfolioDialog({ open, onOpenChange }: AddPortfolioDialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [quantity, setQuantity] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setIsSearching(false);
      setSelectedResult(null);
      setQuantity('');
      setIsAdding(false);
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

  const handleSelect = (result: SearchResult) => {
    setSelectedResult(result);
    setResults([]);
    setQuery('');
  };

  const handleAdd = async () => {
    if (!selectedResult) return;
    const qty = parseFloat(quantity);
    if (!quantity || isNaN(qty) || qty <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedResult.symbol,
          name: selectedResult.name,
          fundType: getFundType(selectedResult.type),
          quantity: qty,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add position');
      }

      toast.success(`${selectedResult.symbol} added to portfolio`);
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add position';
      toast.error(message);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Position</DialogTitle>
          <DialogDescription>
            Search for a ticker to add to your portfolio, then enter your share quantity.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {selectedResult ? (
            <div className="rounded-md border p-3 bg-muted/50">
              <div className="font-medium">{selectedResult.symbol}</div>
              <div className="text-sm text-muted-foreground">{selectedResult.name}</div>
              <div className="text-xs text-muted-foreground">
                {selectedResult.type} &bull; {selectedResult.exchange}
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="mt-2 h-auto p-0 text-xs text-muted-foreground"
                onClick={() => setSelectedResult(null)}
              >
                Change selection
              </Button>
            </div>
          ) : (
            <>
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

              <div className="max-h-48 overflow-y-auto space-y-1">
                {isSearching && (
                  <div className="flex items-center justify-center py-4 text-muted-foreground">
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Searching...
                  </div>
                )}

                {!isSearching && results.length === 0 && query.length > 0 && (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    No results found
                  </div>
                )}

                {!isSearching &&
                  results.map((result) => (
                    <div
                      key={result.symbol}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer"
                      onClick={() => handleSelect(result)}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm">{result.symbol}</div>
                        <div className="text-xs text-muted-foreground truncate">{result.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {result.type} &bull; {result.exchange}
                        </div>
                      </div>
                      <Button size="sm" variant="outline" tabIndex={-1}>
                        Select
                      </Button>
                    </div>
                  ))}
              </div>
            </>
          )}

          {selectedResult && (
            <div className="space-y-2">
              <Label htmlFor="quantity">Number of Shares</Label>
              <Input
                id="quantity"
                type="number"
                min="0.000001"
                step="any"
                placeholder="e.g. 10"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                autoFocus
              />
            </div>
          )}

          {selectedResult && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isAdding}>
                Cancel
              </Button>
              <Button onClick={handleAdd} disabled={isAdding || !quantity}>
                {isAdding ? 'Adding...' : 'Add Position'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
