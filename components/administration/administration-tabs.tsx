'use client';

import { Wallet, Tags, Tag } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AccountList } from '@/components/accounts/account-list';
import { CategoryList } from '@/components/categories/category-list';
import { TagList } from '@/components/tags/tag-list';

interface Account {
  id: string;
  name: string;
  institution: string;
  accountType: string;
  transactionCount: number;
}

interface Category {
  id: string;
  name: string;
  keywords: string[];
  transactionCount: number;
}

interface Tag {
  id: string;
  name: string;
  isBigExpense: boolean;
  transactionCount: number;
}

interface AdministrationTabsProps {
  accounts: Account[];
  categories: Category[];
  tags: Tag[];
}

export function AdministrationTabs({
  accounts,
  categories,
  tags,
}: AdministrationTabsProps) {
  return (
    <Tabs defaultValue="accounts">
      <TabsList>
        <TabsTrigger value="accounts">
          <Wallet />
          Accounts
        </TabsTrigger>
        <TabsTrigger value="categories">
          <Tags />
          Categories
        </TabsTrigger>
        <TabsTrigger value="tags">
          <Tag />
          Tags
        </TabsTrigger>
      </TabsList>
      <TabsContent value="accounts">
        <AccountList accounts={accounts} />
      </TabsContent>
      <TabsContent value="categories">
        <CategoryList categories={categories} />
      </TabsContent>
      <TabsContent value="tags">
        <TagList tags={tags} />
      </TabsContent>
    </Tabs>
  );
}
