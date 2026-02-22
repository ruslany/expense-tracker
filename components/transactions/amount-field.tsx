import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MoneyInput } from '@/components/transactions/money-input';

interface AmountFieldProps {
  isDebit: boolean;
  onIsDebitChange: (isDebit: boolean) => void;
  amountDigits: string;
  onAmountDigitsChange: (digits: string) => void;
  // Used to make label/input id pairs unique when multiple dialogs are mounted
  idPrefix?: string;
}

export function AmountField({
  isDebit,
  onIsDebitChange,
  amountDigits,
  onAmountDigitsChange,
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
        <MoneyInput id={`${idPrefix}-value`} value={amountDigits} onChange={onAmountDigitsChange} />
      </div>
    </>
  );
}
