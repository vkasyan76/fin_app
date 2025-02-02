import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";
import { subDays } from "date-fns";
import { paginationOptsValidator } from "convex/server";

export const get = query({
  args: {
    // Optional: if provided, only return transactions for this account.
    accountId: v.optional(v.id("accounts")),
    // Optional date range (as timestamps). If not provided, default to the last 30 days.
    from: v.optional(v.number()),
    to: v.optional(v.number()),
  },
  handler: async (ctx, { accountId, from, to }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new ConvexError("Unauthorized");

    // Define the default date range: last 30 days.
    const now = Date.now();
    const defaultTo = now;
    const defaultFrom = subDays(defaultTo, 30).getTime();

    // Use provided dates or fallback to defaults.
    const StartDate = from ?? defaultFrom;
    const EndDate = to ?? defaultTo;

    // Build the base query for transactions.
    // We filter by _creationTime and by user.
    let txQuery = ctx.db
      .query("transactions")
      .filter((q) =>
        q.and(
          q.gte(q.field("_creationTime"), StartDate),
          q.lte(q.field("_creationTime"), EndDate),
          q.eq(q.field("userId"), user.subject)
        )
      );

    // If an accountId is provided, further restrict by that account.
    if (accountId) {
      txQuery = txQuery.filter((q) => q.eq(q.field("accountId"), accountId));
    }

    // Execute the query without pagination.
    const transactions = await txQuery.collect();

    // Extract the unique account IDs and category IDs from the transactions.
    const accountIds = Array.from(
      new Set(transactions.map((tx) => tx.accountId))
    );
    const categoryIds = Array.from(
      new Set(
        transactions.map((tx) => tx.categoryId).filter((id) => id != null)
      )
    );

    // Fetch the corresponding account documents.
    const accountsArr = await Promise.all(
      accountIds.map((id) => ctx.db.get(id))
    );
    const accountsMap = new Map();
    for (const acc of accountsArr) {
      if (acc) accountsMap.set(acc._id, acc);
    }

    // Fetch the corresponding category documents.
    const categoriesArr = await Promise.all(
      categoryIds.map((id) => ctx.db.get(id))
    );
    const categoriesMap = new Map();
    for (const cat of categoriesArr) {
      if (cat) categoriesMap.set(cat._id, cat);
    }

    // Build the joined result.
    // Each returned object mimics the structure of your Drizzle query:
    // - id: transaction ID,
    // - category: the category name (or null if missing),
    // - categoryId, payee, amount, notes,
    // - account: the account name,
    // - accountId.
    const data = transactions.map((tx) => ({
      id: tx._id,
      category: tx.categoryId
        ? (categoriesMap.get(tx.categoryId)?.name ?? null)
        : null,
      categoryId: tx.categoryId,
      payee: tx.payee,
      amount: tx.amount,
      notes: tx.notes,
      account: accountsMap.get(tx.accountId)?.name,
      accountId: tx.accountId,
      _creationTime: tx._creationTime, // Included for sorting; omit if not needed.
    }));

    // Sort the results by creation time in descending order.
    data.sort((a, b) => b._creationTime - a._creationTime);

    return data;
  },
});

export const getByDateAndAccount = query({
  args: {
    accountId: v.id("accounts"),
    // Make startDate and endDate optional.
    from: v.optional(v.number()),
    to: v.optional(v.number()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { accountId, from, to, paginationOpts }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new ConvexError("Unauthorized");

    // Get current timestamp
    const now = Date.now();
    // Default endDate is now, and default startDate is 30 days ago
    const defaultTo = now;
    // Default startDate is 30 days before now, using subDays from date-fns.
    const defaultFrom = subDays(defaultTo, 30).getTime();

    // Use provided dates or fallback to defaults
    const StartDate = from ?? defaultFrom;
    const EndDate = to ?? defaultTo;

    return await ctx.db
      .query("transactions")
      .withIndex("by_account_id", (q) => q.eq("accountId", accountId))
      .filter((q) =>
        q.and(
          q.gte(q.field("_creationTime"), StartDate),
          q.lte(q.field("_creationTime"), EndDate),
          q.eq(q.field("userId"), user.subject)
        )
      )
      .paginate(paginationOpts);
  },
});
