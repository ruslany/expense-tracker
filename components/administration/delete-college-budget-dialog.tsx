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

interface DeleteCollegeBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget: { id: string; label: string } | null;
}

export function DeleteCollegeBudgetDialog({
  open,
  onOpenChange,
  budget,
}: DeleteCollegeBudgetDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!budget) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/college-budgets/${budget.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete college budget');
      }

      onOpenChange(false);
      toast.success('College budget deleted successfully');
      router.refresh();
    } catch (error) {
      console.error('Error deleting college budget:', error);
      toast.error('Failed to delete college budget');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete College Budget</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{budget?.label}&quot;? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline" disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
