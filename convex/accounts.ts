import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";
import { mutation } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

// non-paginated query for transactions form
export const getAll = query({
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new ConvexError("Unauthorized");
    }

    return await ctx.db
      .query("accounts")
      .withIndex("by_user_id", (q) => q.eq("userId", user.subject))
      .collect(); // Fetch all documents
  },
});

// paginated query

export const get = query({
  args: {
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
  },
  handler: async (ctx, { search, paginationOpts }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new ConvexError("Unauthorized");
    }
    // return await ctx.db.query("accounts").collect();
    // Personal search
    if (search) {
      return await ctx.db
        .query("accounts")
        .withSearchIndex("search_name", (q) =>
          q.search("name", search).eq("userId", user.subject)
        )
        .paginate(paginationOpts);
    }

    // All personal docs
    return await ctx.db
      .query("accounts")
      .withIndex("by_user_id", (q) => q.eq("userId", user.subject))
      .paginate(paginationOpts);
  },
});

export const getById = query({
  args: {
    id: v.optional(v.id("accounts")),
  },
  handler: async (ctx, { id }) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new ConvexError("Unauthorized");
    }

    if (!id) {
      throw new ConvexError("Missing ID");
    }

    const account = await ctx.db.get(id);

    if (!account) {
      throw new ConvexError(`Account with ID ${id} not found`);
    }

    if (account.userId !== user.subject) {
      throw new ConvexError("Unauthorized access");
    }

    return account;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    plaidId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new ConvexError("Unauthorized");
    }

    // Insert a new account into the "accounts" table
    return await ctx.db.insert("accounts", {
      name: args.name || "Unnamed Account",
      plaidId: args.plaidId,
      userId: user.subject, // Associate the account with the current user
    });
  },
});

export const remove = mutation({
  args: {
    ids: v.array(v.id("accounts")), // Accept an array of account IDs to delete
  },
  handler: async (ctx, { ids }) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new ConvexError("Unauthorized");
    }

    // Validate that the accounts belong to the current user
    const accounts = await Promise.all(
      ids.map(async (id) => {
        const account = await ctx.db.get(id);
        if (!account) {
          throw new ConvexError(`Account with ID ${id} not found`);
        }
        if (account.userId !== user.subject) {
          throw new ConvexError("Unauthorized");
        }
        return account;
      })
    );

    // Delete related transactions for each account
    for (const account of accounts) {
      const transactions = await ctx.db
        .query("transactions")
        .withIndex("by_account_id", (q) => q.eq("accountId", account._id))
        .collect();

      for (const transaction of transactions) {
        await ctx.db.delete(transaction._id);
      }
    }

    // Delete all validated accounts
    const deletedCount = await Promise.all(
      accounts.map((account) => ctx.db.delete(account._id))
    );

    return { deletedCount: deletedCount.length };
  },
});

export const update = mutation({
  args: {
    id: v.id("accounts"), // The ID of the account to update
    name: v.string(), // The new name for the account
  },
  handler: async (ctx, { id, name }) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new ConvexError("Unauthorized");
    }

    const account = await ctx.db.get(id);

    if (!account) {
      throw new ConvexError(`Account with ID ${id} not found`);
    }

    if (account.userId !== user.subject) {
      throw new ConvexError("Unauthorized access");
    }

    // Update the account name
    await ctx.db.patch(id, {
      name,
    });

    return { success: true };
  },
});
