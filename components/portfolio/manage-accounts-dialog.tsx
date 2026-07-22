'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TaxCategory } from '@/types';
import { TAX_CATEGORY_LABELS } from '@/types';

interface ManageAccountsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountNames: string[];
  accountTaxCategories: Record<string, TaxCategory>;
}

export function ManageAccountsDialog({
  open,
  onOpenChange,
  accountNames,
  accountTaxCategories,
}: ManageAccountsDialogProps) {
  const router = useRouter();
  const [savingAccount, setSavingAccount] = useState<string | null>(null);

  const handleChange = async (name: string, taxCategory: TaxCategory) => {
    setSavingAccount(name);
    try {
      const response = await fetch('/api/portfolio-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, taxCategory }),
      });
      if (!response.ok) throw new Error('Failed to update account');
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update account';
      toast.error(message);
    } finally {
      setSavingAccount(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Accounts</DialogTitle>
          <DialogDescription>
            Assign each account to a tax category to break down your portfolio totals.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {accountNames.length === 0 ? (
            <p className="text-sm text-muted-foreground">No accounts yet.</p>
          ) : (
            accountNames.map((name) => (
              <div key={name} className="flex items-center justify-between gap-3">
                <span className="text-sm truncate">{name}</span>
                <Select
                  value={accountTaxCategories[name] ?? 'taxable'}
                  onValueChange={(v) => handleChange(name, v as TaxCategory)}
                  disabled={savingAccount === name}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(TAX_CATEGORY_LABELS) as [TaxCategory, string][]).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
