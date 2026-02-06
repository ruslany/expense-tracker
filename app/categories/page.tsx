import type { Metadata } from 'next';
import { AppShell } from '@/components/app-shell';
import { CategoryList } from '@/components/categories/category-list';
import { fetchCategoriesWithKeywords } from '@/lib/data';

export const metadata: Metadata = { title: 'Categories' };
export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const categories = await fetchCategoriesWithKeywords();

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage expense categories and their auto-categorization keywords
          </p>
        </div>

        <CategoryList categories={categories} />
      </div>
    </AppShell>
  );
}
