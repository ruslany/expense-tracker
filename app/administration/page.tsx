import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { auth } from '@/lib/auth';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_COOKIE } from '@/lib/constants';
import { AppShell } from '@/components/app-shell';
import { AdministrationTabs } from '@/components/administration/administration-tabs';
import {
  fetchAccountsWithTransactionCount,
  fetchCategoriesWithKeywords,
  fetchTagsWithTransactionCount,
  fetchUsers,
  fetchCSVMappings,
} from '@/lib/data';

export const metadata: Metadata = { title: 'Administration' };
export const dynamic = 'force-dynamic';

export default async function AdministrationPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/');
  }

  const cookieStore = await cookies();
  const pageSize = Number(cookieStore.get(PAGE_SIZE_COOKIE)?.value) || DEFAULT_PAGE_SIZE;

  const [accounts, categories, tags, users, csvMappings] = await Promise.all([
    fetchAccountsWithTransactionCount(),
    fetchCategoriesWithKeywords(),
    fetchTagsWithTransactionCount(),
    fetchUsers(),
    fetchCSVMappings(),
  ]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administration</h1>
          <p className="text-muted-foreground">Manage accounts, categories, tags, and users</p>
        </div>

        <AdministrationTabs
          accounts={accounts}
          categories={categories}
          tags={tags}
          users={users}
          csvMappings={csvMappings}
          pageSize={pageSize}
        />
      </div>
    </AppShell>
  );
}
