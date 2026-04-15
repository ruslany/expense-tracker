'use client';

import { useState } from 'react';
import { ArrowLeftRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SUPPORTED_CURRENCIES } from '@/lib/currencies';
import type { ConvertResult, ForexQuote } from '@/types';

function formatRate(rate: number, quoteCurrency: string): string {
  return quoteCurrency === 'JPY' ? rate.toFixed(2) : rate.toFixed(4);
}

function formatResult(value: number, quoteCurrency: string): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: quoteCurrency === 'JPY' ? 0 : 2,
    maximumFractionDigits: quoteCurrency === 'JPY' ? 0 : 2,
  });
}

interface CurrencyConverterProps {
  trackedRates?: ForexQuote[];
}

export function CurrencyConverter({ trackedRates = [] }: CurrencyConverterProps) {
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convert = async (currentAmount: string, currentFrom: string, currentTo: string) => {
    const parsed = parseFloat(currentAmount);
    if (isNaN(parsed) || parsed < 0) {
      setResult(null);
      return;
    }

    setError(null);

    // Check if rate is already available from the tracked rates table
    const symbol = `${currentFrom}${currentTo}=X`;
    const cached = trackedRates.find((e) => e.symbol === symbol);
    if (cached?.rate !== null && cached?.rate !== undefined) {
      setResult({
        rate: cached.rate,
        result: parsed * cached.rate,
        from: currentFrom,
        to: currentTo,
        amount: parsed,
      });
      return;
    }

    // Also check the inverse pair (e.g. EURUSD=X covers both USD→EUR and EUR→USD)
    const inverseSymbol = `${currentTo}${currentFrom}=X`;
    const inverseCached = trackedRates.find((e) => e.symbol === inverseSymbol);
    if (
      inverseCached?.rate !== null &&
      inverseCached?.rate !== undefined &&
      inverseCached.rate !== 0
    ) {
      const rate = 1 / inverseCached.rate;
      setResult({ rate, result: parsed * rate, from: currentFrom, to: currentTo, amount: parsed });
      return;
    }

    // Fall back to API fetch
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/currencies/convert?from=${currentFrom}&to=${currentTo}&amount=${parsed}`,
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch rate');
      }
      const data: ConvertResult = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rate');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFromChange = (value: string) => {
    setFrom(value);
    convert(amount, value, to);
  };

  const handleToChange = (value: string) => {
    setTo(value);
    convert(amount, from, value);
  };

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
    convert(amount, to, from);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Convert</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div className="flex-1 space-y-1.5 w-full">
            <label className="text-sm font-medium text-muted-foreground">Amount</label>
            <Input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onBlur={(e) => convert(e.target.value, from, to)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') convert(amount, from, to);
              }}
              className="w-full"
            />
          </div>

          <div className="space-y-1.5 w-full sm:w-36">
            <label className="text-sm font-medium text-muted-foreground">From</label>
            <Select value={from} onValueChange={handleFromChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={handleSwap}
            className="shrink-0 mt-6 sm:mt-0"
          >
            <ArrowLeftRight className="size-4" />
            <span className="sr-only">Swap currencies</span>
          </Button>

          <div className="space-y-1.5 w-full sm:w-36">
            <label className="text-sm font-medium text-muted-foreground">To</label>
            <Select value={to} onValueChange={handleToChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-muted px-4 py-3 min-h-[60px] flex items-center">
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="size-4 animate-spin" />
              Fetching rate...
            </div>
          )}
          {!isLoading && error && <p className="text-sm text-destructive">{error}</p>}
          {!isLoading && !error && result && (
            <div className="w-full">
              <div className="text-2xl font-semibold">
                {formatResult(result.result, result.to)} {result.to}
              </div>
              <div className="text-sm text-muted-foreground mt-0.5">
                1 {result.from} = {formatRate(result.rate, result.to)} {result.to}
              </div>
            </div>
          )}
          {!isLoading && !error && !result && (
            <p className="text-sm text-muted-foreground">
              Enter an amount and press Enter or click away
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
