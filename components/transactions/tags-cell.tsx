'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon, XIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from '@/components/ui/combobox';

type Tag = {
  id: string;
  name: string;
};

interface TagsCellProps {
  transactionId: string;
  tags: Tag[];
  allTags: Tag[];
}

export function TagsCell({ transactionId, tags, allTags }: TagsCellProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [localTags, setLocalTags] = React.useState<Tag[]>(tags);
  const [availableTags, setAvailableTags] = React.useState<Tag[]>(allTags);
  const [selectedTag, setSelectedTag] = React.useState<Tag | null>(null);

  // Update local state when props change
  React.useEffect(() => {
    setLocalTags(tags);
  }, [tags]);

  React.useEffect(() => {
    setAvailableTags(allTags);
  }, [allTags]);

  const updateTags = async (newTags: Tag[]) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/transactions/${transactionId}/tags`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagIds: newTags.map((t) => t.id) }),
      });

      if (!response.ok) {
        throw new Error('Failed to update tags');
      }

      setLocalTags(newTags);
      router.refresh();
    } catch (error) {
      console.error('Failed to update tags:', error);
      setLocalTags(tags); // Revert on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = async (tag: Tag | null) => {
    if (!tag || localTags.some((t) => t.id === tag.id)) return;

    const newTags = [...localTags, tag];
    await updateTags(newTags);
    setInputValue('');
    setIsOpen(false);
  };

  const handleRemoveTag = async (tagId: string) => {
    const newTags = localTags.filter((t) => t.id !== tagId);
    await updateTags(newTags);
  };

  const handleCreateTag = async () => {
    if (!inputValue.trim()) return;

    setIsLoading(true);
    try {
      // Create the new tag
      const createResponse = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: inputValue.trim() }),
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create tag');
      }

      const newTag = await createResponse.json();

      // Add to available tags
      setAvailableTags((prev) => [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)));

      // Add to transaction
      const newTags = [...localTags, newTag];
      await updateTags(newTags);

      setInputValue('');
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to create tag:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter out already-selected tags from the combobox options
  const selectableTags = availableTags.filter((tag) => !localTags.some((t) => t.id === tag.id));

  // Check if input matches any existing tag
  const inputMatchesExisting = availableTags.some(
    (tag) => tag.name.toLowerCase() === inputValue.trim().toLowerCase(),
  );

  return (
    <div className="flex flex-wrap items-center gap-1">
      {localTags.map((tag) => (
        <Badge key={tag.id} variant="secondary" className="gap-0.5 pr-1 text-xs">
          {tag.name}
          <button
            onClick={() => handleRemoveTag(tag.id)}
            disabled={isLoading}
            className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 disabled:opacity-50"
            aria-label={`Remove ${tag.name} tag`}
          >
            <XIcon className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {isOpen ? (
        <Combobox
          open={isOpen}
          onOpenChange={(open) => {
            if (!open) setIsOpen(false);
          }}
          value={selectedTag}
          onValueChange={(tag) => {
            setSelectedTag(null);
            handleAddTag(tag);
          }}
          inputValue={inputValue}
          onInputValueChange={setInputValue}
          items={selectableTags}
          itemToStringLabel={(tag) => tag?.name ?? ''}
          itemToStringValue={(tag) => tag?.id ?? ''}
          isItemEqualToValue={(a, b) => a?.id === b?.id}
        >
          <ComboboxInput
            placeholder="Add tag..."
            className="h-6 w-28 text-xs"
            autoFocus
            onBlur={() => {
              // Small delay to allow click events to fire
              setTimeout(() => setIsOpen(false), 150);
            }}
            onKeyDown={(e) => {
              if (
                e.key === 'Enter' &&
                inputValue.trim() &&
                !inputMatchesExisting &&
                selectableTags.length === 0
              ) {
                e.preventDefault();
                handleCreateTag();
              }
            }}
          />
          <ComboboxContent>
            {inputValue.trim() && !inputMatchesExisting && (
              <button
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleCreateTag();
                }}
              >
                <PlusIcon className="h-4 w-4" />
                Create &quot;{inputValue.trim()}&quot;
              </button>
            )}
            <ComboboxEmpty>{inputValue.trim() ? '' : 'Type to search or create'}</ComboboxEmpty>
            <ComboboxList>
              {(tag) => (
                <ComboboxItem key={tag.id} value={tag}>
                  {tag.name}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      ) : (
        <button
          onClick={() => {
            setInputValue('');
            setIsOpen(true);
          }}
          disabled={isLoading}
          className="inline-flex h-5 items-center gap-0.5 rounded-full border border-dashed border-muted-foreground/40 px-1.5 text-xs text-muted-foreground hover:border-muted-foreground hover:text-foreground disabled:opacity-50"
          aria-label="Add tag"
        >
          <PlusIcon className="h-3 w-3" />
          {localTags.length === 0 && 'Add tag'}
        </button>
      )}
    </div>
  );
}
