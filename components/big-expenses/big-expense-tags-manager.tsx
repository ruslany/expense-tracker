'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Settings } from 'lucide-react';

interface Tag {
  id: string;
  name: string;
  isBigExpense: boolean;
}

interface BigExpenseTagsManagerProps {
  tags: Tag[];
}

export function BigExpenseTagsManager({ tags }: BigExpenseTagsManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleToggle = async (tagId: string, checked: boolean) => {
    try {
      const response = await fetch(`/api/tags/${tagId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBigExpense: checked }),
      });

      if (!response.ok) {
        throw new Error('Failed to update tag');
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error('Error toggling tag:', error);
    }
  };

  const selectedCount = tags.filter((t) => t.isBigExpense).length;

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings className="h-4 w-4" />
                Configure Big Expense Tags
                <span className="text-sm font-normal text-muted-foreground">
                  ({selectedCount} selected)
                </span>
              </CardTitle>
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground mb-4">
              Select which tags should be included in the Big Expenses pie chart.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${tag.id}`}
                    checked={tag.isBigExpense}
                    disabled={isPending}
                    onCheckedChange={(checked) => handleToggle(tag.id, checked === true)}
                  />
                  <Label
                    htmlFor={`tag-${tag.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {tag.name}
                  </Label>
                </div>
              ))}
            </div>
            {tags.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                No tags found. Create tags on the Transactions page first.
              </p>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
