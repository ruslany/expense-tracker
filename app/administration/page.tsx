import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AppShell } from '@/components/app-shell';
import { AdministrationTabs } from '@/components/administration/administration-tabs';
import {
  fetchAccountsWithTransactionCount,
  fetchCategoriesWithKeywords,
  fetchTagsWithTransactionCount,
  fetchUsers,
} from '@/lib/data';

export const metadata: Metadata = { title: 'Administration' };
export const dynamic = 'force-dynamic';

export default async function AdministrationPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/');
  }

  const [accounts, categories, tags, users] = await Promise.all([
    fetchAccountsWithTransactionCount(),
    fetchCategoriesWithKeywords(),
    fetchTagsWithTransactionCount(),
    fetchUsers(),
  ]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administration</h1>
          <p className="text-muted-foreground">Manage accounts, categories, tags, and users</p>
        </div>

        <AdministrationTabs accounts={accounts} categories={categories} tags={tags} users={users} />
      </div>
    </AppShell>
  );
}
