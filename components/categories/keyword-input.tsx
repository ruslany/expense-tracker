'use client';

import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface KeywordInputProps {
  keywords: string[];
  onChange: (keywords: string[]) => void;
  existingKeywords: string[];
  error?: string;
}

export function KeywordInput({ keywords, onChange, existingKeywords, error }: KeywordInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  const addKeyword = () => {
    const keyword = inputValue.trim();
    if (!keyword) return;

    const keywordLower = keyword.toLowerCase();

    // Check if keyword already exists in this category's list
    if (keywords.map((k) => k.toLowerCase()).includes(keywordLower)) {
      setValidationError('Keyword already added');
      return;
    }

    // Check if keyword exists in other categories
    if (existingKeywords.map((k) => k.toLowerCase()).includes(keywordLower)) {
      setValidationError('Keyword already exists in another category');
      return;
    }

    onChange([...keywords, keyword]);
    setInputValue('');
    setValidationError(null);
  };

  const removeKeyword = (index: number) => {
    onChange(keywords.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setValidationError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type keyword and press Enter"
          className="flex-1"
        />
        <Button type="button" variant="outline" onClick={addKeyword}>
          Add
        </Button>
      </div>
      {(validationError || error) && (
        <p className="text-sm text-destructive">{validationError || error}</p>
      )}
      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {keywords.map((keyword, index) => (
            <Badge key={index} variant="secondary" className="gap-1 pr-1">
              {keyword}
              <button
                type="button"
                onClick={() => removeKeyword(index)}
                className="ml-1 rounded-full hover:bg-muted-foreground/20"
              >
                <X className="size-3" />
                <span className="sr-only">Remove {keyword}</span>
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
