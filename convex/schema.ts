import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  accounts: defineTable({
    plaidId: v.string(), // Plaid ID for the account
    name: v.string(), // Name of the account
    userId: v.string(), // User ID associated with the account
  })
    .index("by_user_id", ["userId"]) // Index for querying by userId
    .index("by_plaid_id", ["plaidId"]) // Index for querying by plaidId
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["userId"],
    }), // Search index for querying by name

  categories: defineTable({
    name: v.string(), // Name of the category
    userId: v.string(), // User ID associated with the category
  })
    .index("by_user_id", ["userId"]) // Query categories by user
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["userId"],
    }),
});
