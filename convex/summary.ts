import { ConvexError, v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { subDays, parse, differenceInDays } from "date-fns";
import { calculatePercentageChange, fillMissingDays } from "@/lib/utils";

export const getSummary = query({
  args: {
    accountId: v.optional(v.id("accounts")),
    from: v.optional(v.string()), // Expected format: "yyyy-MM-dd"
    to: v.optional(v.string()), // Expected format: "yyyy-MM-dd"
  },
  handler: async (ctx, { accountId, from, to }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user || !user.subject) {
      throw new ConvexError("Unauthorized");
    }

    const userId = user.subject as string;

    // Define the date range (default: last 30 days)
    const defaultTo = new Date();
    const defaultFrom = subDays(defaultTo, 30);

    const startDate = from
      ? parse(from, "yyyy-MM-dd", new Date())
      : defaultFrom;
    const endDate = to ? parse(to, "yyyy-MM-dd", new Date()) : defaultTo;
    const periodLength = differenceInDays(endDate, startDate) + 1;

    const lastPeriodStart = subDays(startDate, periodLength);
    const lastPeriodEnd = subDays(endDate, periodLength);

    // Helper function to fetch financial data for a given period
    async function fetchFinancialData(start: Date, end: Date) {
      const transactions = await ctx.db
        .query("transactions")
        .filter((q) =>
          q.and(
            q.eq(q.field("userId"), userId),
            accountId ? q.eq(q.field("accountId"), accountId) : true,
            q.gte(q.field("date"), start.getTime()),
            q.lte(q.field("date"), end.getTime())
          )
        )
        .collect();

      const income = transactions
        .filter((tx) => tx.amount > 0)
        .reduce((sum, tx) => sum + tx.amount, 0);
      const expenses = transactions
        .filter((tx) => tx.amount < 0)
        .reduce((sum, tx) => sum + tx.amount, 0);
      const remaining = transactions.reduce((sum, tx) => sum + tx.amount, 0);

      return { income, expenses, remaining };
    }

    const currentPeriod = await fetchFinancialData(startDate, endDate);
    const lastPeriod = await fetchFinancialData(lastPeriodStart, lastPeriodEnd);

    const incomeChange = calculatePercentageChange(
      currentPeriod.income,
      lastPeriod.income
    );
    const expensesChange = calculatePercentageChange(
      currentPeriod.expenses,
      lastPeriod.expenses
    );
    const remainingChange = calculatePercentageChange(
      currentPeriod.remaining,
      lastPeriod.remaining
    );

    // **Category Summary**
    const categorySpending = await ctx.db
      .query("transactions")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), userId),
          accountId ? q.eq(q.field("accountId"), accountId) : true,
          q.lt(q.field("amount"), 0),
          q.gte(q.field("date"), startDate.getTime()),
          q.lte(q.field("date"), endDate.getTime())
        )
      )
      .collect();

    const categoryTotals: Record<string, number> = {};
    for (const tx of categorySpending) {
      if (!tx.categoryId) continue;
      categoryTotals[tx.categoryId] =
        (categoryTotals[tx.categoryId] || 0) + Math.abs(tx.amount);
    }

    const categoryIds = Object.keys(categoryTotals);
    const categoryDocs = await Promise.all(
      categoryIds.map(async (id) => {
        const category = await ctx.db.get(id as Id<"categories">);
        return category
          ? { id, name: category.name, value: categoryTotals[id] }
          : null;
      })
    );

    const validCategories = categoryDocs.filter(Boolean) as {
      id: string;
      name: string;
      value: number;
    }[];
    validCategories.sort((a, b) => b.value - a.value);

    const topCategories = validCategories.slice(0, 3);
    const otherCategories = validCategories.slice(3);
    const otherSum = otherCategories.reduce(
      (sum, current) => sum + current.value,
      0
    );
    const finalCategories = [...topCategories];

    if (otherCategories.length > 0) {
      finalCategories.push({ id: "other", name: "Other", value: otherSum });
    }

    // **Daily Spend Summary**
    const transactions = await ctx.db
      .query("transactions")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), userId),
          accountId ? q.eq(q.field("accountId"), accountId) : true,
          q.gte(q.field("date"), startDate.getTime()),
          q.lte(q.field("date"), endDate.getTime())
        )
      )
      .collect();

    const activeDays: { date: Date; income: number; expenses: number }[] = [];

    for (const tx of transactions) {
      const txDate = new Date(tx.date);
      const existing = activeDays.find(
        (d) => d.date.getTime() === txDate.getTime()
      );

      if (existing) {
        if (tx.amount >= 0) existing.income += tx.amount;
        else existing.expenses += Math.abs(tx.amount);
      } else {
        activeDays.push({
          date: txDate,
          income: tx.amount >= 0 ? tx.amount : 0,
          expenses: tx.amount < 0 ? Math.abs(tx.amount) : 0,
        });
      }
    }

    // const days = fillMissingDays(activeDays, startDate, endDate);
    // Issue: Date Format Not Supported by Convex
    const days = fillMissingDays(activeDays, startDate, endDate).map((day) => ({
      ...day,
      date: day.date.toISOString(), // Convert Date to string
    }));

    return {
      data: {
        remainingAmount: currentPeriod.remaining,
        remainingChange,
        incomeAmount: currentPeriod.income,
        incomeChange,
        expensesAmount: currentPeriod.expenses,
        expensesChange,
        categories: finalCategories,
        days,
      },
    };
  },
});
