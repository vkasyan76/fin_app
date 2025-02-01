"use client";

import { usePaginatedQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { NewCategorySheet } from "./new-category-sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { columns, Category } from "./columns";
import { DataTable } from "@/components/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { Row } from "@tanstack/react-table";

export default function CategoriesPage() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.categories.get,
    {},
    { initialNumItems: 5 }
  );

  const deleteCategories = useMutation(api.categories.remove);

  const mappedResults = results?.map((category) => ({
    id: category._id as Id<"categories">, // Map `_id` to `id`
    name: category.name,
    _creationTime: category._creationTime,
  }));

  // Determine if there are more items to load based on the `status`
  const canLoadMore = status === "CanLoadMore";
  const isLoading = status === "LoadingFirstPage";

  const handleNextPage = () => {
    if (canLoadMore) {
      loadMore(5); // Load 5 more items
    }
  };

  const handleDelete = async (rows: Row<Category>[]) => {
    const ids = rows.map((row) => row.original.id); // Access the `id`
    await deleteCategories({ ids });
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
          <CardTitle className="text-xl line-clamp-1">
            Categories page
          </CardTitle>
          <NewCategorySheet />
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
