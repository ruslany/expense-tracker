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

  const getDisplayAmount = () => {
    if (!amountDigits) return '';
    const cents = parseInt(amountDigits, 10);
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(cents / 100);
  };

  const getAmountValue = () => {
    if (!amountDigits) return 0;
    const cents = parseInt(amountDigits, 10);
    return isDebit ? -(cents / 100) : cents / 100;
  };

  const handleAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      if (amountDigits.length < 9) {
        setAmountDigits(amountDigits + e.key);
      }
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      setAmountDigits(amountDigits.slice(0, -1));
    } else if (e.key === 'Delete') {
      e.preventDefault();
      setAmountDigits('');
    } else if (!['Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleAmountPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
    if (digits) {
      setAmountDigits(digits.slice(0, 9));
    }
  };

  const isAmountValid = amountDigits.length > 0 && parseInt(amountDigits, 10) > 0;

  return {
    isDebit,
    setIsDebit,
    getDisplayAmount,
    getAmountValue,
    handleAmountKeyDown,
    handleAmountPaste,
    isAmountValid,
    reset,
  };
}
