import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface AmountFieldProps {
  isDebit: boolean;
  onIsDebitChange: (isDebit: boolean) => void;
  displayAmount: string;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  // Used to make label/input id pairs unique when multiple dialogs are mounted
  idPrefix?: string;
}

export function AmountField({
  isDebit,
  onIsDebitChange,
  displayAmount,
  onKeyDown,
  onPaste,
  idPrefix = 'amount',
}: AmountFieldProps) {
  return (
    <>
      <div className="grid gap-2">
        <Label>Type</Label>
        <RadioGroup
          value={isDebit ? 'debit' : 'credit'}
          onValueChange={(v) => onIsDebitChange(v === 'debit')}
          className="flex gap-6"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="debit" id={`${idPrefix}-debit`} />
            <Label htmlFor={`${idPrefix}-debit`}>Debit</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="credit" id={`${idPrefix}-credit`} />
            <Label htmlFor={`${idPrefix}-credit`}>Credit</Label>
          </div>
        </RadioGroup>
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-value`}>Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
            $
          </span>
          <Input
            id={`${idPrefix}-value`}
            className="pl-7 font-mono"
            value={displayAmount}
            placeholder="0.00"
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            onChange={() => {}}
            inputMode="numeric"
          />
        </div>
      </div>
    </>
  );
}
