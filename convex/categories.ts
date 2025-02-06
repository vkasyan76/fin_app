// convex/categories.ts
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
      .query("categories")
      .withIndex("by_user_id", (q) => q.eq("userId", user.subject))
      .collect(); // Fetch all documents
  },
});

// paginated query

// Query: Get categories with optional search
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

    // If a search term is provided, use the search index.
    if (search) {
      return await ctx.db
        .query("categories")
        .withSearchIndex("search_name", (q) =>
          q.search("name", search).eq("userId", user.subject)
        )
        .paginate(paginationOpts);
    }

    // Otherwise, return all categories for the user.
    return await ctx.db
      .query("categories")
      .withIndex("by_user_id", (q) => q.eq("userId", user.subject))
      .paginate(paginationOpts);
  },
});

// Query: Get a category by its ID.
export const getById = query({
  args: {
    id: v.optional(v.id("categories")),
  },
  handler: async (ctx, { id }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new ConvexError("Unauthorized");
    }
    if (!id) {
      throw new ConvexError("Missing ID");
    }

    const category = await ctx.db.get(id);
    if (!category) {
      throw new ConvexError(`Category with ID ${id} not found`);
    }
    if (category.userId !== user.subject) {
      throw new ConvexError("Unauthorized access");
    }
    return category;
  },
});

// Mutation: Create a new category.
export const create = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new ConvexError("Unauthorized");
    }
    // Insert a new category into the "categories" table.
    return await ctx.db.insert("categories", {
      name: args.name || "Unnamed Category",
      userId: user.subject,
    });
  },
});

// Mutation: Remove categories.
export const remove = mutation({
  args: {
    ids: v.array(v.id("categories")),
  },
  handler: async (ctx, { ids }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new ConvexError("Unauthorized");
    }

    // Validate that the categories belong to the current user.
    const categories = await Promise.all(
      ids.map(async (id) => {
        const category = await ctx.db.get(id);
        if (!category) {
          throw new ConvexError(`Category with ID ${id} not found`);
        }
        if (category.userId !== user.subject) {
          throw new ConvexError("Unauthorized");
        }
        return category;
      })
    );

    // Delete all validated categories.
    const deletedCount = await Promise.all(
      categories.map((category) => ctx.db.delete(category._id))
    );

    return { deletedCount: deletedCount.length };
  },
});

// Mutation: Update an existing category.
export const update = mutation({
  args: {
    id: v.id("categories"),
    name: v.string(),
  },
  handler: async (ctx, { id, name }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new ConvexError("Unauthorized");
    }
    const category = await ctx.db.get(id);
    if (!category) {
      throw new ConvexError(`Category with ID ${id} not found`);
    }
    if (category.userId !== user.subject) {
      throw new ConvexError("Unauthorized access");
    }

    // Update the category name.
    await ctx.db.patch(id, { name });
    return { success: true };
  },
});
