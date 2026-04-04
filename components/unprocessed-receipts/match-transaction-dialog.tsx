'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Search, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { formatCurrency, formatDate } from '@/lib/utils';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  account: { name: string };
}

interface MatchTransactionDialogProps {
  receiptId: string;
  receiptFileName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMatched: () => void;
}

export function MatchTransactionDialog({
  receiptId,
  receiptFileName,
  open,
  onOpenChange,
  onMatched,
}: MatchTransactionDialogProps) {
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    setSearch('');
    setStartDate(undefined);
    setEndDate(undefined);
    setTransactions([]);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchTransactions();
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, startDate, endDate, open]);

  async function fetchTransactions() {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ pageSize: '20' });
      if (search) params.set('search', search);
      if (startDate) params.set('startDate', format(startDate, 'yyyy-MM-dd'));
      if (endDate) params.set('endDate', format(endDate, 'yyyy-MM-dd'));

      const res = await fetch(`/api/transactions?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setTransactions(data.data ?? []);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAssign(transactionId: string) {
    setAssigningId(transactionId);
    try {
      const res = await fetch(`/api/receipts/${receiptId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to assign');
      }
      toast.success('Receipt matched to transaction');
      onOpenChange(false);
      onMatched();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to assign receipt');
    } finally {
      setAssigningId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col">
        <DialogHeader>
          <DialogTitle>Match Receipt to Transaction</DialogTitle>
          <DialogDescription className="truncate">Assigning: {receiptFileName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search transactions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-muted-foreground">From</label>
              <DatePicker date={startDate} onDateChange={setStartDate} placeholder="Start date" />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs text-muted-foreground">To</label>
              <DatePicker date={endDate} onDateChange={setEndDate} placeholder="End date" />
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : transactions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {search || startDate || endDate
                ? 'No transactions match your search.'
                : 'Search by description, or pick a date range.'}
            </p>
          ) : (
            <ul className="divide-y">
              {transactions.map((tx) => (
                <li key={tx.id}>
                  <button
                    className="w-full px-2 py-3 text-left transition-colors hover:bg-muted disabled:opacity-50"
                    onClick={() => handleAssign(tx.id)}
                    disabled={assigningId !== null}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(new Date(tx.date))} · {tx.account.name}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold tabular-nums">
                        {formatCurrency(tx.amount)}
                      </span>
                      {assigningId === tx.id && (
                        <Loader2 className="size-4 shrink-0 animate-spin" />
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
