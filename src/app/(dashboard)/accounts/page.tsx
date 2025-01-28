"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { NewAccountSheet } from "./new-account-sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { columns } from "./columns";
import { DataTable } from "@/components/data-table";

export default function AccountsPage() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.accounts.get,
    {},
    { initialNumItems: 5 }
  );

  const mappedResults = results?.map((account) => ({
    id: account._id, // Map `_id` to `id`
    name: account.name, // Keep the `name` field
  }));

  // Determine if there are more items to load based on the `status`
  const canLoadMore = status === "CanLoadMore";

  const handleNextPage = () => {
    if (canLoadMore) {
      loadMore(5); // Load 5 more items
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-28">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">Accounts page</CardTitle>
          <NewAccountSheet />
          {/* <Button size="sm">
            <Plus className="size-4 mr-1" />
            Add new
          </Button> */}
        </CardHeader>
        <CardContent>
          <DataTable
            filterKey="name"
            columns={columns}
            data={mappedResults || []}
            onDelete={() => {
              console.log("Add delete functionality here");
            }}
            onNextPage={handleNextPage}
            hasMore={canLoadMore}
            disabled={!results || results?.length === 0}
          />
        </CardContent>
      </Card>
    </div>
  );
}
