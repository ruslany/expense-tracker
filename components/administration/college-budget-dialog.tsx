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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CollegeBudget } from './college-budget-list';

interface Tag {
  id: string;
  name: string;
}

interface CollegeBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget?: CollegeBudget | null;
  tags: Tag[];
}

export function CollegeBudgetDialog({
  open,
  onOpenChange,
  budget,
  tags,
}: CollegeBudgetDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [label, setLabel] = useState('');
  const [academicYearStart, setAcademicYearStart] = useState<Date | undefined>(undefined);
  const [academicYearEnd, setAcademicYearEnd] = useState<Date | undefined>(undefined);
  const [tagId, setTagId] = useState('');
  const [limitAmount, setLimitAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!budget;

  useEffect(() => {
    if (open) {
      if (budget) {
        setLabel(budget.label);
        setAcademicYearStart(new Date(budget.academicYearStart));
        setAcademicYearEnd(new Date(budget.academicYearEnd));
        setTagId(budget.tagId);
        setLimitAmount(budget.limitAmount.toString());
        setNotes(budget.notes ?? '');
      } else {
        setLabel('');
        setAcademicYearStart(undefined);
        setAcademicYearEnd(undefined);
        setTagId('');
        setLimitAmount('');
        setNotes('');
      }
      setError(null);
    }
  }, [open, budget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const url = isEditing ? `/api/college-budgets/${budget.id}` : '/api/college-budgets';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label,
          academicYearStart,
          academicYearEnd,
          tagId,
          limitAmount: parseFloat(limitAmount),
          notes: notes.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save college budget');
      }

      onOpenChange(false);
      toast.success(
        isEditing ? 'College budget updated successfully' : 'College budget created successfully',
      );
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save college budget';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    label.trim() && academicYearStart && academicYearEnd && tagId && parseFloat(limitAmount) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit College Budget' : 'Add College Budget'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Make changes to the academic year budget.'
              : "Track spend against a school's published cost-of-attendance limit for an academic year."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Daughter - Seattle 2026-27"
                required
                maxLength={100}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Academic year start</Label>
                <DatePicker date={academicYearStart} onDateChange={setAcademicYearStart} />
              </div>
              <div className="grid gap-2">
                <Label>Academic year end</Label>
                <DatePicker date={academicYearEnd} onDateChange={setAcademicYearEnd} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Tag</Label>
              <Select value={tagId} onValueChange={setTagId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a tag" />
                </SelectTrigger>
                <SelectContent>
                  {tags.map((tag) => (
                    <SelectItem key={tag.id} value={tag.id}>
                      {tag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="limit-amount">Limit amount</Label>
              <Input
                id="limit-amount"
                type="number"
                step="0.01"
                min="0"
                value={limitAmount}
                onChange={(e) => setLimitAmount(e.target.value)}
                placeholder="18858"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes"
                maxLength={2000}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !canSubmit}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Save changes' : 'Create budget'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
