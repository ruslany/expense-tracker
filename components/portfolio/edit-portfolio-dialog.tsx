'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AssetClass } from '@/types';
import { ASSET_CLASS_LABELS } from '@/types';

interface EditPortfolioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: { id: string; symbol: string; name: string; quantity: number; assetClass: AssetClass } | null;
}

export function EditPortfolioDialog({ open, onOpenChange, item }: EditPortfolioDialogProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState('');
  const [assetClass, setAssetClass] = useState<AssetClass>('other');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && item) {
      setQuantity(String(item.quantity));
      setAssetClass(item.assetClass);
    }
  }, [open, item]);

  const handleSave = async () => {
    if (!item) return;
    const qty = parseFloat(quantity);
    if (!quantity || isNaN(qty) || qty <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/portfolio/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: qty, assetClass }),
      });

      if (!response.ok) throw new Error('Failed to update position');

      toast.success(`${item.symbol} updated`);
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update position';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Position</DialogTitle>
          <DialogDescription>
            Update shares and asset class for{' '}
            <strong>
              {item?.symbol} — {item?.name}
            </strong>
            .
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-quantity">Number of Shares</Label>
            <Input
              id="edit-quantity"
              type="number"
              min="0.000001"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-asset-class">Asset Class</Label>
            <Select value={assetClass} onValueChange={(v) => setAssetClass(v as AssetClass)}>
              <SelectTrigger id="edit-asset-class">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(ASSET_CLASS_LABELS) as [AssetClass, string][]).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !quantity}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
