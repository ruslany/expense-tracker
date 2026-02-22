'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { formatInTimeZone } from 'date-fns-tz';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AmountField } from '@/components/transactions/amount-field';
import { useAmountInput } from '@/hooks/use-amount-input';

interface Category {
  id: string;
  name: string;
}

interface EditTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string;
  date: Date;
  description: string;
  amount: number;
  categoryId: string | null;
  categories: Category[];
}

export function EditTransactionDialog({
  open,
  onOpenChange,
  transactionId,
  date,
  description,
  amount,
  categoryId,
  categories,
}: EditTransactionDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editDate, setEditDate] = useState<Date>(date);
  const [editDescription, setEditDescription] = useState(description);
  const { isDebit, setIsDebit, getDisplayAmount, getAmountValue, handleAmountKeyDown, handleAmountPaste, isAmountValid, reset: resetAmount } = useAmountInput();
  const [editCategoryId, setEditCategoryId] = useState<string>(categoryId ?? '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setEditDate(date);
      setEditDescription(description);
      resetAmount(amount);
      setEditCategoryId(categoryId ?? '');
      setError(null);
    }
  }, [open, date, description, amount, categoryId, resetAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: editDate.toISOString(),
          description: editDescription,
          amount: getAmountValue(),
          categoryId: editCategoryId || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update transaction');
      }

      onOpenChange(false);
      toast.success('Transaction updated successfully');
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update transaction';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = editDescription.trim() && isAmountValid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>Make changes to the transaction details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'justify-start font-normal',
                      !editDate && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editDate ? formatInTimeZone(editDate, 'UTC', 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editDate}
                    onSelect={(d) => d && setEditDate(d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                required
              />
            </div>
            <AmountField
              idPrefix="edit-transaction"
              isDebit={isDebit}
              onIsDebitChange={setIsDebit}
              displayAmount={getDisplayAmount()}
              onKeyDown={handleAmountKeyDown}
              onPaste={handleAmountPaste}
            />
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Category (optional)</Label>
              <Select value={editCategoryId} onValueChange={setEditCategoryId}>
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !isValid}>
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
