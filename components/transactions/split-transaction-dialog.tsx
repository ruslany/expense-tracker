'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MoneyInput } from '@/components/transactions/money-input';

interface Category {
  id: string;
  name: string;
}

interface SplitLine {
  description: string;
  amountDigits: string; // raw digit string, e.g. "4599" = $45.99
  categoryId: string;
}

interface SplitTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string;
  description: string;
  amount: number;
  categoryId: string | null;
  categories: Category[];
}

export function SplitTransactionDialog({
  open,
  onOpenChange,
  transactionId,
  description,
  amount,
  categoryId,
  categories,
}: SplitTransactionDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<SplitLine[]>([]);

  // Sign is inherited from the original transaction — no UI toggle needed.
  const isDebit = amount < 0;

  useEffect(() => {
    if (open) {
      setLines([
        {
          description,
          amountDigits: Math.round(Math.abs(amount) * 100).toString(),
          categoryId: categoryId ?? '',
        },
        { description: '', amountDigits: '', categoryId: '' },
      ]);
      setError(null);
    }
  }, [open, description, amount, categoryId]);

  const lineAmounts = lines.map((l) =>
    l.amountDigits ? parseInt(l.amountDigits, 10) / 100 : 0,
  );
  const splitsTotal = lineAmounts.reduce((sum, v) => sum + v, 0);
  const originalAbs = Math.abs(amount);
  const difference = Math.abs(splitsTotal - originalAbs);
  const isBalanced = difference < 0.01;

  const validLines = lines.filter(
    (l) => l.description.trim() && l.amountDigits && parseInt(l.amountDigits, 10) > 0,
  );
  const canSubmit = isBalanced && validLines.length >= 2 && validLines.length === lines.length;

  const updateLine = (index: number, field: keyof SplitLine, value: string) => {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  };

  const addLine = () => {
    setLines((prev) => [...prev, { description: '', amountDigits: '', categoryId: '' }]);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 2) return;
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/transactions/${transactionId}/split`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          splits: lines.map((l) => {
            const abs = parseInt(l.amountDigits, 10) / 100;
            return {
              description: l.description,
              amount: isDebit ? -abs : abs,
              categoryId: l.categoryId || null,
            };
          }),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to split transaction');
      }

      onOpenChange(false);
      toast.success('Transaction split successfully');
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to split transaction';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Split Transaction</DialogTitle>
          <DialogDescription>
            Split {formatCurrency(amount)} into multiple parts. Amounts must add up exactly.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-3 py-4">
            {lines.map((line, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="flex-1 grid grid-cols-[1fr_auto_auto] gap-2">
                  <div className="space-y-1">
                    {index === 0 && (
                      <Label className="text-xs text-muted-foreground">Description</Label>
                    )}
                    <Input
                      placeholder="Description"
                      value={line.description}
                      onChange={(e) => updateLine(index, 'description', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1 w-40">
                    {index === 0 && (
                      <Label className="text-xs text-muted-foreground">Category</Label>
                    )}
                    <Select
                      value={line.categoryId}
                      onValueChange={(v) => updateLine(index, 'categoryId', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1 w-32">
                    {index === 0 && (
                      <Label className="text-xs text-muted-foreground">Amount</Label>
                    )}
                    <MoneyInput
                      value={line.amountDigits}
                      onChange={(digits) => updateLine(index, 'amountDigits', digits)}
                    />
                  </div>
                </div>
                <div className={cn('pt-0', index === 0 && 'pt-5')}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removeLine(index)}
                    disabled={lines.length <= 2}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" size="sm" onClick={addLine}>
              <Plus className="size-4 mr-1" />
              Add split
            </Button>

            <div
              className={cn(
                'text-sm font-medium pt-2 border-t',
                isBalanced
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400',
              )}
            >
              Total: {formatCurrency(isDebit ? -splitsTotal : splitsTotal)} /{' '}
              {formatCurrency(amount)}
              {!isBalanced && <span className="ml-2">(off by {formatCurrency(difference)})</span>}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !canSubmit}>
              {isSubmitting ? 'Splitting...' : 'Split Transaction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
