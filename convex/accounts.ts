import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";
import { mutation } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

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
