'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { formatInTimeZone } from 'date-fns-tz';
import { CalendarIcon, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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
  const [date, setDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  });
  const [description, setDescription] = useState('');
  const [amountDigits, setAmountDigits] = useState(''); // raw digits, e.g. "4599" = $45.99
  const [isDebit, setIsDebit] = useState(true);
  const [categoryId, setCategoryId] = useState<string>('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setAccountId('');
      const now = new Date();
      setDate(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
      setDescription('');
      setAmountDigits('');
      setIsDebit(true);
      setCategoryId('');
      setCalendarOpen(false);
      setError(null);
    }
  }, [open]);

  const getDisplayAmount = () => {
    if (!amountDigits) return '';
    const cents = parseInt(amountDigits, 10);
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(cents / 100);
  };

  const getAmountValue = () => {
    if (!amountDigits) return 0;
    const cents = parseInt(amountDigits, 10);
    return isDebit ? -(cents / 100) : cents / 100;
  };

  const handleAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      if (amountDigits.length < 9) {
        setAmountDigits(amountDigits + e.key);
      }
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      setAmountDigits(amountDigits.slice(0, -1));
    } else if (e.key === 'Delete') {
      e.preventDefault();
      setAmountDigits('');
    } else if (!['Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleAmountPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
    if (digits) {
      setAmountDigits(digits.slice(0, 9));
    }
  };

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
          amount: getAmountValue(),
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

  const isValid = accountId && description.trim() && amountDigits.length > 0 && parseInt(amountDigits, 10) > 0;

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
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn('justify-start font-normal', !date && 'text-muted-foreground')}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? formatInTimeZone(date, 'UTC', 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => {
                      if (d) {
                        setDate(new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())));
                        setCalendarOpen(false);
                      }
                    }}
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
              <Label>Type</Label>
              <RadioGroup
                value={isDebit ? 'debit' : 'credit'}
                onValueChange={(v) => setIsDebit(v === 'debit')}
                className="flex gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="debit" id="type-debit" />
                  <Label htmlFor="type-debit">Debit</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="credit" id="type-credit" />
                  <Label htmlFor="type-credit">Credit</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
                  $
                </span>
                <Input
                  id="amount"
                  className="pl-7 font-mono"
                  value={getDisplayAmount()}
                  placeholder="0.00"
                  onKeyDown={handleAmountKeyDown}
                  onPaste={handleAmountPaste}
                  onChange={() => {}}
                  inputMode="numeric"
                />
              </div>
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
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  if (session?.user?.role !== 'admin') {
    return null;
  }

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
