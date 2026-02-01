import { LayoutDashboard, CreditCard, Upload, Wallet, PieChart, Tags } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Big Expenses',
    href: '/big-expenses',
    icon: PieChart,
  },
  {
    title: 'Transactions',
    href: '/transactions',
    icon: CreditCard,
  },
  {
    title: 'Categories',
    href: '/categories',
    icon: Tags,
  },
  {
    title: 'Import',
    href: '/import',
    icon: Upload,
  },
  {
    title: 'Accounts',
    href: '/accounts',
    icon: Wallet,
  },
];
