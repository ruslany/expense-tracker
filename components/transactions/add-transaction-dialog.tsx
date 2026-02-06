'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CalendarIcon, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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

interface Account {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: Account[];
  categories: Category[];
}

export function AddTransactionDialog({
  open,
  onOpenChange,
  accounts,
  categories,
}: AddTransactionDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setAccountId('');
      setDate(new Date());
      setDescription('');
      setAmount('');
      setCategoryId('');
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          date: date.toISOString(),
          description,
          amount: parseFloat(amount),
          categoryId: categoryId || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create transaction');
      }

      onOpenChange(false);
      toast.success('Transaction created successfully');
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create transaction';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = accountId && description.trim() && amount && !isNaN(parseFloat(amount));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>Manually add a new transaction.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="account">Account</Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger id="account">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn('justify-start font-normal', !date && 'text-muted-foreground')}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Grocery shopping"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g., -45.99"
                required
              />
              <p className="text-xs text-muted-foreground">
                Use negative values for expenses, positive for income/credits.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category (optional)</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="category">
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
              {isSubmitting ? 'Creating...' : 'Create transaction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface AddTransactionButtonProps {
  accounts: Account[];
  categories: Category[];
}

export function AddTransactionButton({ accounts, categories }: AddTransactionButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add Transaction</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <AddTransactionDialog
        open={open}
        onOpenChange={setOpen}
        accounts={accounts}
        categories={categories}
      />
    </>
  );
}
