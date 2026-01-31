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
import { KeywordInput } from './keyword-input';

interface Category {
  id: string;
  name: string;
  keywords: string[];
}

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  existingKeywords: string[];
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  existingKeywords,
}: CategoryDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!category;

  useEffect(() => {
    if (open) {
      if (category) {
        setName(category.name);
        setKeywords(category.keywords);
      } else {
        setName('');
        setKeywords([]);
      }
      setError(null);
    }
  }, [open, category]);

  // Filter out current category's keywords from existingKeywords
  const filteredExistingKeywords = category
    ? existingKeywords.filter((k) => !category.keywords.map((ck) => ck.toLowerCase()).includes(k.toLowerCase()))
    : existingKeywords;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const url = isEditing ? `/api/categories/${category.id}` : '/api/categories';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, keywords }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save category');
      }

      onOpenChange(false);
      toast.success(isEditing ? 'Category updated successfully' : 'Category created successfully');
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save category';
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
          <DialogTitle>{isEditing ? 'Edit Category' : 'Add Category'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Make changes to the category name and keywords.'
              : 'Create a new category with optional keywords for auto-categorization.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Category name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Keywords</Label>
              <KeywordInput
                keywords={keywords}
                onChange={setKeywords}
                existingKeywords={filteredExistingKeywords}
              />
              <p className="text-xs text-muted-foreground">
                Transactions containing these keywords will be auto-categorized.
              </p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Save changes' : 'Create category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
