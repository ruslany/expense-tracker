import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, format } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const monthParam = searchParams.get("month");

    const now = new Date();
    const startDate = monthParam
      ? startOfMonth(new Date(monthParam))
      : startOfMonth(now);
    const endDate = monthParam ? endOfMonth(new Date(monthParam)) : endOfMonth(now);

    // Fetch all transactions for the month
    const transactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            institution: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    // Calculate summary stats
    const totalSpent = transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalIncome = transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const netCashFlow = totalIncome - totalSpent;
    const transactionCount = transactions.length;

    // Calculate top categories
    const categoryTotals = new Map<string, number>();
    transactions.forEach((t) => {
      if (t.amount < 0) {
        const category = t.category || "Uncategorized";
        const current = categoryTotals.get(category) || 0;
        categoryTotals.set(category, current + Math.abs(t.amount));
      }
    });

    const topCategories = Array.from(categoryTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / totalSpent) * 100,
      }));

    // Get recent transactions
    const recentTransactions = transactions.slice(0, 10).map((t) => ({
      id: t.id,
      date: t.date,
      description: t.description,
      amount: t.amount,
      category: t.category,
      merchant: t.merchant,
    }));

    // Calculate spending by day
    const spendingByDay = new Map<string, number>();
    transactions.forEach((t) => {
      if (t.amount < 0) {
        const dateKey = format(t.date, "MMM d");
        const current = spendingByDay.get(dateKey) || 0;
        spendingByDay.set(dateKey, current + Math.abs(t.amount));
      }
    });

    const spendingByDayArray = Array.from(spendingByDay.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json({
      totalSpent,
      totalIncome,
      netCashFlow,
      transactionCount,
      topCategories,
      recentTransactions,
      spendingByDay: spendingByDayArray,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
