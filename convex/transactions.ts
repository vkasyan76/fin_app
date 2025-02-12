import { ConvexError, v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { query } from "./_generated/server";
// import { subDays } from "date-fns";
// import { paginationOptsValidator } from "convex/server";
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
  date: number;
};

type JoinedTransaction = {
  id: Id<"transactions">;
  payee: string;
  amount: number;
  notes?: string;
  _creationTime: number;
  date: number;
  accountId: Id<"accounts">;
  account: string | null;
  categoryId?: Id<"categories">;
  category: string | null;
};

export const get = query({
  args: {
    // Remove paginationOpts now.
    search: v.optional(v.string()),
    accountId: v.optional(v.id("accounts")),
    from: v.optional(v.number()),
    to: v.optional(v.number()),
  },
  handler: async (ctx, { search, accountId, from, to }) => {
    // Ensure the user is authenticated.
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new ConvexError("Unauthorized");

    // Define the date range (defaulting to the last 30 days).
    const now = Date.now();
    // const defaultFrom = subDays(now, 30).getTime();  // returns only last 30 days
    const defaultFrom = 0; // start from the Unix epoch.
    const startDate = from ?? defaultFrom;
    const endDate = to ?? now;

    // Build the base query for transactions - return all transactions in the past.
    const baseQuery = ctx.db
      .query("transactions")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), user.subject),
          q.gte(q.field("date"), startDate),
          q.lte(q.field("date"), endDate)
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

    // Instead of paginating, simply collect all matching transactions.
    const transactions = (await finalQuery.collect()) as Transaction[];

    // Extract unique account IDs and category IDs.
    const accountIds = Array.from(
      new Set(transactions.map((tx) => tx.accountId))
    );

    // Boolean(id)) portion serves as a type guard that removes any falsy values (like undefined) from the list.
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
      if (account) accountsMap.set(account._id, account);
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
      if (category) categoriesMap.set(category._id, category);
    }

    // Build the joined transactions.
    const joinedTransactions: JoinedTransaction[] = transactions.map((tx) => ({
      id: tx._id,
      payee: tx.payee,
      amount: tx.amount,
      notes: tx.notes,
      _creationTime: tx._creationTime,
      date: tx.date,
      accountId: tx.accountId,
      account: accountsMap.get(tx.accountId)?.name ?? null,
      categoryId: tx.categoryId,
      category: tx.categoryId
        ? (categoriesMap.get(tx.categoryId)?.name ?? null)
        : null,
    }));

    // Sort the joined transactions by creation time (descending).
    joinedTransactions.sort((a, b) => b.date - a.date);

    // Return the joined transactions (no pagination info needed).
    return joinedTransactions;
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
      date: tx.date, // expose the creation time as "date"
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
    date: v.number(),
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
      date: args.date,
      userId: user.subject,
    });
  },
});

// bulk Create - for uploaded spreadsheet

export const bulkCreate = mutation({
  args: {
    transactions: v.array(
      v.object({
        accountId: v.id("accounts"),
        categoryId: v.optional(v.id("categories")),
        amount: v.float64(),
        payee: v.string(),
        notes: v.optional(v.string()),
        date: v.number(),
      })
    ),
  },
  handler: async (ctx, { transactions }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new ConvexError("Unauthorized");
    }

    // Insert all transactions in a single batch
    const insertedTransactions = await Promise.all(
      transactions.map(async (transaction) => {
        return ctx.db.insert("transactions", {
          accountId: transaction.accountId,
          categoryId: transaction.categoryId,
          amount: transaction.amount,
          payee: transaction.payee,
          notes: transaction.notes,
          date: transaction.date,
          userId: user.subject, // Assign the user ID from authentication
        });
      })
    );

    return insertedTransactions; // Return the inserted transaction IDs
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
    date: v.number(),
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
      date: args.date,
    };

    await ctx.db.patch(args.id, updateData);

    // Optionally, you could fetch and return the updated transaction.
    return { success: true };
  },
});

// Define a mutation to update the category of a transaction to use in category-column.tsx.
export const updateTransactionCategory = mutation({
  args: {
    id: v.id("transactions"),
    // categoryId is optional so you can clear it if needed.
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, { id, categoryId }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new ConvexError("Unauthorized");

    // Fetch the transaction to ensure it belongs to the user.
    const tx = await ctx.db.get(id);
    if (!tx || tx.userId !== user.subject) {
      throw new ConvexError("Transaction not found or unauthorized");
    }

    // Update only the categoryId.
    await ctx.db.patch(id, { categoryId });
    return { success: true };
  },
});
