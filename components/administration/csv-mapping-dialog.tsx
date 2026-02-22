'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { KeywordInput } from './keyword-input';

interface CSVMapping {
  id: string;
  institution: string;
  skipPatterns: string[];
}

interface CSVMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mapping: CSVMapping | null;
}

export function CSVMappingDialog({ open, onOpenChange, mapping }: CSVMappingDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skipPatterns, setSkipPatterns] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && mapping) {
      setSkipPatterns(mapping.skipPatterns);
      setError(null);
    }
  }, [open, mapping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapping) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/csv-mappings/${mapping.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skipPatterns }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save import rules');
      }

      onOpenChange(false);
      toast.success('Import rules updated successfully');
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save import rules';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Import Rules</DialogTitle>
          <DialogDescription>
            Configure skip patterns for{' '}
            <span className="font-medium">{mapping?.institution}</span>. Transactions whose
            descriptions match any of these patterns will be ignored during import.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Skip Patterns</Label>
              <KeywordInput
                keywords={skipPatterns}
                onChange={setSkipPatterns}
                existingKeywords={[]}
              />
              <p className="text-xs text-muted-foreground">
                Transactions containing these strings will be skipped on import.
              </p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
