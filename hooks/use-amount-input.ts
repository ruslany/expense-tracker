import { useState, useCallback } from 'react';

export function useAmountInput() {
  const [amountDigits, setAmountDigits] = useState('');
  const [isDebit, setIsDebit] = useState(true);

  // Reset to empty (add) or initialize from an existing signed amount (edit).
  // amount < 0 → debit, amount > 0 → credit, undefined → empty debit
  const reset = useCallback((amount?: number) => {
    if (amount !== undefined && amount !== 0) {
      setAmountDigits(Math.round(Math.abs(amount) * 100).toString());
      setIsDebit(amount < 0);
    } else {
      setAmountDigits('');
      setIsDebit(true);
    }
  }, []);

  const getAmountValue = () => {
    if (!amountDigits) return 0;
    const cents = parseInt(amountDigits, 10);
    return isDebit ? -(cents / 100) : cents / 100;
  };

  const isAmountValid = amountDigits.length > 0 && parseInt(amountDigits, 10) > 0;

  return {
    amountDigits,
    setAmountDigits,
    isDebit,
    setIsDebit,
    getAmountValue,
    isAmountValid,
    reset,
  };
}
