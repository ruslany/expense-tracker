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
  item: {
    id: string;
    symbol: string;
    name: string;
    accountName: string;
    quantity: number;
    assetClass: AssetClass;
    isManual: boolean;
    manualPrice: number | null;
  } | null;
}

export function EditPortfolioDialog({ open, onOpenChange, item }: EditPortfolioDialogProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [accountName, setAccountName] = useState('');
  const [assetClass, setAssetClass] = useState<AssetClass>('other');
  const [manualPrice, setManualPrice] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && item) {
      setName(item.name);
      setQuantity(String(item.quantity));
      setAccountName(item.accountName);
      setAssetClass(item.assetClass);
      setManualPrice(item.manualPrice !== null ? String(item.manualPrice) : '');
    }
  }, [open, item]);

  const handleSave = async () => {
    if (!item) return;
    const qty = parseFloat(quantity);
    if (!quantity || isNaN(qty) || qty <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    let navPrice: number | null = null;
    if (item.isManual) {
      navPrice = parseFloat(manualPrice);
      if (!manualPrice || isNaN(navPrice) || navPrice <= 0) {
        toast.error('Please enter a valid NAV price');
        return;
      }
      if (!name.trim()) {
        toast.error('Please enter a fund name');
        return;
      }
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/portfolio/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: qty,
          assetClass,
          accountName: accountName.trim() || undefined,
          ...(item.isManual ? { name: name.trim(), manualPrice: navPrice } : {}),
        }),
      });

      if (!response.ok) throw new Error('Failed to update position');

      toast.success(`${item.isManual ? item.name : item.symbol} updated`);
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
            {item?.isManual ? (
              <>
                Update details for <strong>{item?.name}</strong>.
              </>
            ) : (
              <>
                Update shares and asset class for{' '}
                <strong>
                  {item?.symbol} — {item?.name}
                </strong>
                .
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {item?.isManual && (
            <div className="space-y-2">
              <Label htmlFor="edit-name">Fund Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="edit-account-name">Account</Label>
            <Input
              id="edit-account-name"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="e.g. My Brokerage"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-quantity">Number of Shares</Label>
            <Input
              id="edit-quantity"
              type="number"
              min="0.000001"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              autoFocus={!item?.isManual}
            />
          </div>
          {item?.isManual && (
            <div className="space-y-2">
              <Label htmlFor="edit-manual-price">NAV Price</Label>
              <Input
                id="edit-manual-price"
                type="number"
                min="0.000001"
                step="any"
                value={manualPrice}
                onChange={(e) => setManualPrice(e.target.value)}
              />
            </div>
          )}
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
