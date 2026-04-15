'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SUPPORTED_CURRENCIES } from '@/lib/currencies';

interface AddCurrencyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingSymbols: string[];
}

export function AddCurrencyDialog({ open, onOpenChange, existingSymbols }: AddCurrencyDialogProps) {
  const router = useRouter();
  const [base, setBase] = useState('USD');
  const [quote, setQuote] = useState('EUR');
  const [isAdding, setIsAdding] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setBase('USD');
      setQuote('EUR');
      setValidationError(null);
      setIsAdding(false);
    }
  }, [open]);

  useEffect(() => {
    if (base === quote) {
      setValidationError('Base and quote currencies must be different');
      return;
    }
    const symbol = `${base}${quote}=X`;
    if (existingSymbols.includes(symbol)) {
      setValidationError(`${base}/${quote} is already being tracked`);
      return;
    }
    setValidationError(null);
  }, [base, quote, existingSymbols]);

  const handleAdd = async () => {
    if (validationError) return;

    setIsAdding(true);
    try {
      const symbol = `${base}${quote}=X`;
      const response = await fetch('/api/currencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, baseCurrency: base, quoteCurrency: quote }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add currency pair');
      }

      toast.success(`${base}/${quote} added to tracked currencies`);
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add currency pair';
      toast.error(message);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Track Currency Pair</DialogTitle>
          <DialogDescription>
            Select a base and quote currency to add to your tracked list.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3">
          <div className="flex-1 space-y-1.5">
            <label className="text-sm font-medium">Base</label>
            <Select value={base} onValueChange={setBase}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <span className="text-muted-foreground mt-5">/</span>

          <div className="flex-1 space-y-1.5">
            <label className="text-sm font-medium">Quote</label>
            <Select value={quote} onValueChange={setQuote}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {validationError && (
          <p className="text-sm text-destructive">{validationError}</p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isAdding}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={isAdding || !!validationError}>
            {isAdding ? 'Adding...' : `Add ${base}/${quote}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
