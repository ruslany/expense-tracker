'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface RemoveCurrencyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: { id: string; baseCurrency: string; quoteCurrency: string } | null;
}

export function RemoveCurrencyDialog({ open, onOpenChange, item }: RemoveCurrencyDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const pairLabel = item ? `${item.baseCurrency}/${item.quoteCurrency}` : '';

  const handleDelete = async () => {
    if (!item) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/currencies/${item.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove currency pair');
      }

      onOpenChange(false);
      toast.success(`${pairLabel} removed from tracked currencies`);
      router.refresh();
    } catch (error) {
      console.error('Error removing currency pair:', error);
      toast.error('Failed to remove currency pair');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Currency Pair</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove <strong>{pairLabel}</strong> from your tracked
            currencies? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Removing...' : 'Remove'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
