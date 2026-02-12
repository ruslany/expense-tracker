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

interface UnsplitTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string;
}

export function UnsplitTransactionDialog({
  open,
  onOpenChange,
  transactionId,
}: UnsplitTransactionDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUnsplit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/transactions/${transactionId}/split`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to unsplit transaction');
      }

      onOpenChange(false);
      toast.success('Transaction unsplit successfully');
      router.refresh();
    } catch (error) {
      console.error('Error unsplitting transaction:', error);
      toast.error('Failed to unsplit transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unsplit Transaction</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove all split parts and restore the original transaction.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleUnsplit} disabled={isSubmitting}>
            {isSubmitting ? 'Unsplitting...' : 'Unsplit'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
