"use client";

import { usePaginatedQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { NewAccountSheet } from "./new-account-sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { columns, Account } from "./columns";
import { DataTable } from "@/components/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { Row } from "@tanstack/react-table";

export default function AccountsPage() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.accounts.get,
    {},
    { initialNumItems: 5 }
  );

  const deleteAccounts = useMutation(api.accounts.remove);

  const mappedResults = results?.map((account) => ({
    id: account._id as Id<"accounts">, // Explicitly cast `_id` to `Id<"accounts">`  // Map `_id` to `id`
    // id: account._id,
    name: account.name, // Keep the `name` field
    _creationTime: account._creationTime, // Map creation time
  }));

  // Determine if there are more items to load based on the `status`
  const canLoadMore = status === "CanLoadMore";
  const isLoading = status === "LoadingFirstPage";

  const handleNextPage = () => {
    if (canLoadMore) {
      loadMore(5); // Load 5 more items
    }
  };

  const handleDelete = async (rows: Row<Account>[]) => {
    const ids = rows.map((row) => row.original.id); // Correctly access the `id`
    await deleteAccounts({ ids }); // Call the Convex mutation
  };

  if (isLoading) {
    return (
      <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
        <Card className="border-none drop-shadow-sm">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <div className="h-[500px] w-full flex items-center justify-center">
              <Loader2 className="size-6 text-slate-300 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-28">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">Accounts page</CardTitle>
          <NewAccountSheet />
        </CardHeader>
        <CardContent>
          <DataTable
            filterKey="name"
            columns={columns}
            data={mappedResults || []}
            onDelete={handleDelete}
            onNextPage={handleNextPage}
            hasMore={canLoadMore}
            disabled={!results || results?.length === 0}
          />
        </CardContent>
      </Card>
    </div>
  );
}
