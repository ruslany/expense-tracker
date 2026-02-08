'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatInTimeZone } from 'date-fns-tz';
import { toast } from 'sonner';
import { Upload, FileText, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn, formatDate } from '@/lib/utils';

interface Account {
  id: string;
  name: string;
  institution: string;
  accountType: string;
}

interface RecentTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: { id: string; name: string } | null;
}

export function CSVUploader() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<RecentTransaction[] | null>(null);
  const [cutoffDate, setCutoffDate] = useState<Date | undefined>(undefined);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);

  useEffect(() => {
    async function fetchAccounts() {
      try {
        const response = await fetch('/api/accounts');
        if (response.ok) {
          const data = await response.json();
          setAccounts(data);
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    }
    fetchAccounts();
  }, []);

  useEffect(() => {
    async function fetchRecentTransactions() {
      if (!selectedAccountId) {
        setRecentTransactions([]);
        return;
      }
      try {
        const response = await fetch(`/api/transactions?accountId=${selectedAccountId}&pageSize=3`);
        if (response.ok) {
          const data = await response.json();
          setRecentTransactions(data.data);
        }
      } catch (error) {
        console.error('Error fetching recent transactions:', error);
      }
    }
    fetchRecentTransactions();
  }, [selectedAccountId]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
    if (!file || !selectedAccount) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('institution', selectedAccount.institution);
      formData.append('accountId', selectedAccount.id);
      if (cutoffDate) {
        formData.append('cutoffDate', cutoffDate.toISOString());
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setPreview(data.preview);
        toast.success(`Imported ${data.imported} transaction${data.imported === 1 ? '' : 's'}`);
        router.refresh();
      } else {
        toast.error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Error uploading file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Selector */}
      <div className="space-y-2">
        <Label htmlFor="account">Select Account</Label>
        <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
          <SelectTrigger id="account">
            <SelectValue placeholder="Choose your account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Recent Transactions */}
      {recentTransactions.length > 0 && (
        <div className="space-y-2">
          <Label>Recent Transactions</Label>
          {/* Mobile Card View */}
          <div className="space-y-3 md:hidden">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="rounded-lg border p-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{formatDate(tx.date)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Description:</span>
                  <span className="font-medium truncate ml-2 max-w-[60%] text-right">
                    {tx.description}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{tx.category?.name ?? '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">${Math.abs(tx.amount).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="whitespace-nowrap">{formatDate(tx.date)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{tx.description}</TableCell>
                    <TableCell>{tx.category?.name ?? '—'}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      ${Math.abs(tx.amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground">
            Use the cutoff date below to skip transactions before a certain date
          </p>
        </div>
      )}

      {/* Date Cutoff Filter */}
      <div className="space-y-2">
        <Label>Import transactions from (optional)</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              data-empty={!cutoffDate}
              className="justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
            >
              {cutoffDate ? formatInTimeZone(cutoffDate, 'UTC', 'PPP') : <span>Pick a date</span>}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={cutoffDate}
              onSelect={setCutoffDate}
              defaultMonth={cutoffDate}
              className="[--cell-size:--spacing(7)]"
            />
          </PopoverContent>
        </Popover>
        <p className="text-xs text-muted-foreground">
          Transactions before this date will be skipped
        </p>
      </div>

      {/* Drag and Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 sm:p-12 transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
        )}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="absolute inset-0 cursor-pointer opacity-0"
        />

        {!file ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Drop your CSV file here, or click to browse</p>
              <p className="text-xs text-muted-foreground">
                Supports CSV files from credit card institutions
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                setPreview(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Upload Button */}
      <Button
        onClick={handleUpload}
        disabled={!file || !selectedAccountId || isUploading}
        className="w-full"
      >
        {isUploading ? 'Uploading...' : 'Upload and Import'}
      </Button>

      {/* Imported Transactions Preview */}
      {preview && preview.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Imported Transactions</h3>

          {/* Mobile Card View */}
          <div className="space-y-3 md:hidden">
            {preview.map((tx) => (
              <div key={tx.id} className="rounded-lg border p-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{formatDate(tx.date)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Description:</span>
                  <span className="font-medium truncate ml-2 max-w-[60%] text-right">
                    {tx.description}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{tx.category?.name ?? '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">${Math.abs(tx.amount).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="whitespace-nowrap">{formatDate(tx.date)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{tx.description}</TableCell>
                    <TableCell>{tx.category?.name ?? '—'}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      ${Math.abs(tx.amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
