import { ConvexError, v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { subDays } from "date-fns";
import { paginationOptsValidator } from "convex/server";
import { mutation } from "./_generated/server";

// Define our document types with proper Convex IDs.
type Transaction = {
  _id: Id<"transactions">;
  _creationTime: number;
  categoryId?: Id<"categories">;
  notes?: string;
  userId: string;
  accountId: Id<"accounts">;
  amount: number;
  payee: string;
};

type JoinedTransaction = {
  id: Id<"transactions">;
  payee: string;
  amount: number;
  notes?: string;
  _creationTime: number;
  accountId: Id<"accounts">;
  account: string | null;
  categoryId?: Id<"categories">;
  category: string | null;
};

export const getTransactions = query({
  args: {
    // Required pagination options.
    paginationOpts: paginationOptsValidator,
    // Optional search string to filter the payee.
    search: v.optional(v.string()),
    // Optional filter to restrict to a given account.
    accountId: v.optional(v.id("accounts")),
    // Optional date range (as timestamps). Defaults to the last 30 days.
    from: v.optional(v.number()),
    to: v.optional(v.number()),
  },
  handler: async (ctx, { paginationOpts, search, accountId, from, to }) => {
    // Ensure the user is authenticated.
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new ConvexError("Unauthorized");

    // Define the date range (defaulting to the last 30 days).
    const now = Date.now();
    const defaultFrom = subDays(now, 30).getTime();
    const startDate = from ?? defaultFrom;
    const endDate = to ?? now;

    // Build the base query for transactions.
    const baseQuery = ctx.db
      .query("transactions")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), user.subject),
          q.gte(q.field("_creationTime"), startDate),
          q.lte(q.field("_creationTime"), endDate)
        )
      );

    // Apply search on the "payee" field if a search term is provided.
    const queryWithSearch = search
      ? baseQuery.withSearchIndex("search_payee", (q) =>
          q.search("payee", search)
        )
      : baseQuery;

    // Filter by account if an accountId is provided.
    const finalQuery = accountId
      ? queryWithSearch.filter((q) => q.eq(q.field("accountId"), accountId))
      : queryWithSearch;

    // Paginate the query.
    const result = await finalQuery.paginate(paginationOpts);
    // The paginated result has a "page" property that is an array of documents.
    const transactions = result.page as Transaction[];

    // Extract unique account IDs and category IDs.
    const accountIds = Array.from(
      new Set(transactions.map((tx) => tx.accountId))
    );
    const categoryIds = Array.from(
      new Set(
        transactions
          .map((tx) => tx.categoryId)
          .filter((id): id is Id<"categories"> => Boolean(id))
      )
    );

    // Fetch the corresponding account documents.
    const accountDocs = await Promise.all(
      accountIds.map(
        (id) =>
          ctx.db.get(id) as Promise<{
            _id: Id<"accounts">;
            name: string;
          } | null>
      )
    );
    const accountsMap = new Map<Id<"accounts">, { name: string }>();
    for (const account of accountDocs) {
      if (account) {
        accountsMap.set(account._id, account);
      }
    }

    // Fetch the corresponding category documents.
    const categoryDocs = await Promise.all(
      categoryIds.map(
        (id) =>
          ctx.db.get(id) as Promise<{
            _id: Id<"categories">;
            name: string;
          } | null>
      )
    );
    const categoriesMap = new Map<Id<"categories">, { name: string }>();
    for (const category of categoryDocs) {
      if (category) {
        categoriesMap.set(category._id, category);
      }
    }

    // Build the joined transactions.
    const joinedTransactions: JoinedTransaction[] = transactions.map((tx) => ({
      id: tx._id,
      payee: tx.payee,
      amount: tx.amount,
      notes: tx.notes,
      _creationTime: tx._creationTime,
      accountId: tx.accountId,
      account: accountsMap.get(tx.accountId)?.name ?? null,
      categoryId: tx.categoryId,
      category: tx.categoryId
        ? (categoriesMap.get(tx.categoryId)?.name ?? null)
        : null,
    }));

    // Sort the joined transactions by creation time (descending).
    joinedTransactions.sort((a, b) => b._creationTime - a._creationTime);

    // Return the joined transactions along with the pagination info.
    return {
      page: joinedTransactions,
      continueCursor: result.continueCursor,
      isDone: result.isDone,
    };
  },
});

export const getById = query({
  // 1. Define the expected argument (a valid transaction ID)
  args: { id: v.id("transactions") },
  handler: async (ctx, { id }) => {
    // 2. Ensure the user is authenticated
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new ConvexError("Unauthorized");

    // 3. Retrieve the transaction document by id
    // check transaction exists and aligns with the authenticated user’s details
    const tx = await ctx.db.get(id);
    if (!tx || tx.userId !== user.subject) {
      throw new ConvexError("Not found");
    }

    // 4. Fetch related account and category documents
    const account = await ctx.db.get(tx.accountId);
    const category = tx.categoryId ? await ctx.db.get(tx.categoryId) : null;

    // 5. Build and return the joined output
    return {
      id: tx._id,
      date: tx._creationTime, // expose the creation time as "date"
      payee: tx.payee,
      amount: tx.amount,
      notes: tx.notes,
      account: account ? account.name : null,
      accountId: tx.accountId,
      category: category ? category.name : null,
      categoryId: tx.categoryId,
    };
  },
});

export const create = mutation({
  // Define the arguments the user must supply. Notice that we omit an id field.
  args: {
    accountId: v.id("accounts"),
    categoryId: v.optional(v.id("categories")),
    amount: v.float64(),
    payee: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Retrieve the authenticated user.
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new ConvexError("Unauthorized");
    }

    // Insert a new transaction into the "transactions" table.
    // The user-supplied values come from args, while userId is taken from auth.
    return await ctx.db.insert("transactions", {
      accountId: args.accountId,
      categoryId: args.categoryId,
      amount: args.amount,
      payee: args.payee,
      notes: args.notes,
      userId: user.subject,
    });
  },
});

export const remove = mutation({
  args: {
    // Accept an array of transaction IDs to delete.
    ids: v.array(v.id("transactions")),
  },
  handler: async (ctx, { ids }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new ConvexError("Unauthorized");
    }

    // Validate that each transaction exists and belongs to the current user.
    await Promise.all(
      ids.map(async (id) => {
        const tx = await ctx.db.get(id);
        if (!tx) {
          throw new ConvexError(`Transaction with ID ${id} not found`);
        }
        if (tx.userId !== user.subject) {
          throw new ConvexError("Unauthorized");
        }
      })
    );

    // Delete each transaction and return its ID.
    const deletedIds = await Promise.all(
      ids.map(async (id) => {
        await ctx.db.delete(id);
        return id;
      })
    );

    return deletedIds;
  },
});

export const update = mutation({
  args: {
    // The ID of the transaction to update.
    id: v.id("transactions"),
    // Fields to update; adjust these as needed based on your schema.
    accountId: v.id("accounts"),
    categoryId: v.optional(v.id("categories")),
    amount: v.float64(),
    payee: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Ensure the user is authenticated.
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new ConvexError("Unauthorized");
    }

    // 2. Fetch the transaction.
    const tx = await ctx.db.get(args.id);
    if (!tx) {
      throw new ConvexError(`Transaction with ID ${args.id} not found`);
    }

    // 3. Verify that the transaction belongs to the authenticated user.
    if (tx.userId !== user.subject) {
      throw new ConvexError("Unauthorized access");
    }

    // 4. Update the transaction with the provided fields.
    const updateData = {
      accountId: args.accountId,
      categoryId: args.categoryId,
      amount: args.amount,
      payee: args.payee,
      notes: args.notes,
    };

    await ctx.db.patch(args.id, updateData);

    // Optionally, you could fetch and return the updated transaction.
    return { success: true };
  },
});

// export const get = query({
//   args: {
//     // Optional: if provided, only return transactions for this account.
//     accountId: v.optional(v.id("accounts")),
//     // Optional date range (as timestamps). If not provided, default to the last 30 days.
//     from: v.optional(v.number()),
//     to: v.optional(v.number()),
//   },
//   handler: async (ctx, { accountId, from, to }) => {
//     const user = await ctx.auth.getUserIdentity();
//     if (!user) throw new ConvexError("Unauthorized");

//     // Define the default date range: last 30 days.
//     const now = Date.now();
//     const defaultTo = now;
//     const defaultFrom = subDays(defaultTo, 30).getTime();

//     // Use provided dates or fallback to defaults.
//     const StartDate = from ?? defaultFrom;
//     const EndDate = to ?? defaultTo;

//     // Build the base query for transactions.
//     // We filter by _creationTime and by user.
//     let txQuery = ctx.db
//       .query("transactions")
//       .filter((q) =>
//         q.and(
//           q.gte(q.field("_creationTime"), StartDate),
//           q.lte(q.field("_creationTime"), EndDate),
//           q.eq(q.field("userId"), user.subject)
//         )
//       );

//     // If an accountId is provided, further restrict by that account.
//     if (accountId) {
//       txQuery = txQuery.filter((q) => q.eq(q.field("accountId"), accountId));
//     }

//     // Execute the query without pagination.
//     const transactions = await txQuery.collect();

//     // Extract the unique account IDs and category IDs from the transactions.
//     const accountIds = Array.from(
//       new Set(transactions.map((tx) => tx.accountId))
//     );
//     const categoryIds = Array.from(
//       new Set(
//         transactions.map((tx) => tx.categoryId).filter((id) => id != null)
//       )
//     );

//     // Fetch the corresponding account documents.
//     const accountsArr = await Promise.all(
//       accountIds.map((id) => ctx.db.get(id))
//     );
//     const accountsMap = new Map();
//     for (const acc of accountsArr) {
//       if (acc) accountsMap.set(acc._id, acc);
//     }

//     // Fetch the corresponding category documents.
//     const categoriesArr = await Promise.all(
//       categoryIds.map((id) => ctx.db.get(id))
//     );
//     const categoriesMap = new Map();
//     for (const cat of categoriesArr) {
//       if (cat) categoriesMap.set(cat._id, cat);
//     }

//     // Build the joined result.
//     // Each returned object mimics the structure of your Drizzle query:
//     // - id: transaction ID,
//     // - category: the category name (or null if missing),
//     // - categoryId, payee, amount, notes,
//     // - account: the account name,
//     // - accountId.
//     const data = transactions.map((tx) => ({
//       id: tx._id,
//       category: tx.categoryId
//         ? (categoriesMap.get(tx.categoryId)?.name ?? null)
//         : null,
//       categoryId: tx.categoryId,
//       payee: tx.payee,
//       amount: tx.amount,
//       notes: tx.notes,
//       account: accountsMap.get(tx.accountId)?.name,
//       accountId: tx.accountId,
//       _creationTime: tx._creationTime, // Included for sorting; omit if not needed.
//     }));

//     // Sort the results by creation time in descending order.
//     data.sort((a, b) => b._creationTime - a._creationTime);

//     return data;
//   },
// });

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
