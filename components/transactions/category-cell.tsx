'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from '@/components/ui/combobox';

type Category = {
  id: string;
  name: string;
};

interface CategoryCellProps {
  transactionId: string;
  categoryId: string | null;
  categoryName: string | null;
  categories: Category[];
}

export function CategoryCell({
  transactionId,
  categoryId,
  categoryName,
  categories,
}: CategoryCellProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(
    categoryId && categoryName ? { id: categoryId, name: categoryName } : null,
  );

  const handleValueChange = async (category: Category | null) => {
    // Ignore spurious null when categories haven't loaded yet
    if (categories.length === 0) return;
    // Ignore if value hasn't actually changed
    if (category?.id === categoryId) return;
    // Ignore if both are null (no change)
    if (category === null && categoryId === null) return;

    setSelectedCategory(category);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId: category?.id ?? null }),
      });

      if (!response.ok) {
        throw new Error('Failed to update category');
      }

      router.refresh();
    } catch (error) {
      console.error('Failed to update category:', error);
      setSelectedCategory(
        categoryId && categoryName ? { id: categoryId, name: categoryName } : null,
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    if (!isAdmin) {
      return (
        <span
          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: categoryName ? 'hsl(var(--secondary))' : 'transparent',
            color: categoryName ? 'inherit' : 'hsl(var(--muted-foreground))',
          }}
        >
          {categoryName || 'Uncategorized'}
        </span>
      );
    }
    return (
      <button
        onClick={() => {
          setInputValue('');
          setIsOpen(true);
        }}
        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors hover:ring-2 hover:ring-ring hover:ring-offset-1 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
        style={{
          backgroundColor: categoryName ? 'hsl(var(--secondary))' : 'transparent',
          color: categoryName ? 'inherit' : 'hsl(var(--muted-foreground))',
        }}
        disabled={isLoading}
      >
        {isLoading ? 'Saving...' : categoryName || 'Uncategorized'}
      </button>
    );
  }

  return (
    <Combobox
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) setIsOpen(false);
      }}
      value={selectedCategory}
      onValueChange={handleValueChange}
      inputValue={inputValue}
      onInputValueChange={setInputValue}
      items={categories}
      itemToStringLabel={(category) => category.name}
      itemToStringValue={(category) => category.id}
      isItemEqualToValue={(a, b) => a.id == b.id}
    >
      <ComboboxInput
        placeholder="Search categories..."
        className="h-7 w-40 text-xs"
        autoFocus
        onBlur={() => setIsOpen(false)}
      />
      <ComboboxContent>
        <ComboboxEmpty>No categories found</ComboboxEmpty>
        <ComboboxList>
          {(category) => (
            <ComboboxItem key={category.id} value={category}>
              {category.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
