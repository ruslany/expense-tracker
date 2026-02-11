'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { TriangleAlertIcon } from 'lucide-react';
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
import { Input } from '@/components/ui/input';

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: { id: string; name: string; transactionCount: number } | null;
}

export function DeleteAccountDialog({ open, onOpenChange, account }: DeleteAccountDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState('');

  const requiresConfirmation = account != null && account.transactionCount > 0;
  const confirmationMatch = !requiresConfirmation || confirmationInput === account?.name;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setConfirmationInput('');
    }
    onOpenChange(nextOpen);
  };

  const handleDelete = async () => {
    if (!account || !confirmationMatch) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/accounts/${account.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      handleOpenChange(false);
      toast.success('Account deleted successfully');
      router.refresh();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <TriangleAlertIcon className="text-destructive size-5" />
            Delete Account
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              <p>
                Are you sure you want to delete &quot;{account?.name}&quot;?
                {account && account.transactionCount > 0 ? (
                  <>
                    {' '}
                    This account has <strong>{account.transactionCount} transaction(s)</strong> that
                    will also be permanently deleted.
                  </>
                ) : (
                  <> This action cannot be undone.</>
                )}
              </p>
              {requiresConfirmation && (
                <div className="mt-4">
                  <p className="mb-2 text-sm">
                    Type <strong className="text-foreground">{account?.name}</strong> to confirm:
                  </p>
                  <Input
                    value={confirmationInput}
                    onChange={(e) => setConfirmationInput(e.target.value)}
                    placeholder={account?.name}
                    autoComplete="off"
                  />
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || !confirmationMatch}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
