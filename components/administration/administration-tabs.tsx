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
  isEssential: boolean;
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
          <span className="hidden sm:inline">Accounts</span>
        </TabsTrigger>
        <TabsTrigger value="categories">
          <Tags />
          <span className="hidden sm:inline">Categories</span>
        </TabsTrigger>
        <TabsTrigger value="tags">
          <Tag />
          <span className="hidden sm:inline">Tags</span>
        </TabsTrigger>
        <TabsTrigger value="users">
          <Users />
          <span className="hidden sm:inline">Users</span>
        </TabsTrigger>
        <TabsTrigger value="import-rules">
          <FileInput />
          <span className="hidden sm:inline">Import Rules</span>
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
