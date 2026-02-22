import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

function formatDigits(digits: string): string {
  if (!digits) return '';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parseInt(digits, 10) / 100);
}

interface MoneyInputProps {
  value: string; // raw digit string, e.g. "4599" = $45.99
  onChange: (digits: string) => void;
  id?: string;
  className?: string;
}

export function MoneyInput({ value, onChange, id, className }: MoneyInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      if (value.length < 9) onChange(value + e.key);
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      onChange(value.slice(0, -1));
    } else if (e.key === 'Delete') {
      e.preventDefault();
      onChange('');
    } else if (
      !['Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)
    ) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
    if (digits) onChange(digits.slice(0, 9));
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
        $
      </span>
      <Input
        id={id}
        className={cn('pl-7 font-mono', className)}
        value={formatDigits(value)}
        placeholder="0.00"
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onChange={() => {}}
        inputMode="numeric"
      />
    </div>
  );
}
