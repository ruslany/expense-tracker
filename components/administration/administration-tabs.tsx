'use client';

import { Wallet, Tags, Tag, Users, FileInput } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AccountList } from './account-list';
import { CategoryList } from './category-list';
import { TagList } from './tag-list';
import { UserList } from './user-list';
import { CSVMappingList } from './csv-mapping-list';

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

interface User {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
}

interface CSVMapping {
  id: string;
  institution: string;
  skipPatterns: string[];
}

interface AdministrationTabsProps {
  accounts: Account[];
  categories: Category[];
  tags: Tag[];
  users: User[];
  csvMappings: CSVMapping[];
}

export function AdministrationTabs({
  accounts,
  categories,
  tags,
  users,
  csvMappings,
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
        <TabsTrigger value="users">
          <Users />
          Users
        </TabsTrigger>
        <TabsTrigger value="import-rules">
          <FileInput />
          Import Rules
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
      <TabsContent value="users">
        <UserList users={users} />
      </TabsContent>
      <TabsContent value="import-rules">
        <CSVMappingList mappings={csvMappings} />
      </TabsContent>
    </Tabs>
  );
}
