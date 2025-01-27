"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { NewAccountSheet } from "./new-account-sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Payment, columns } from "./columns";
import { DataTable } from "@/components/data-table";

const data: Payment[] = [
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "728ed52f",
    amount: 50,
    status: "success",
    email: "a@example.com",
  },
];

export default function AccountsPage() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.accounts.get,
    {},
    { initialNumItems: 5 }
  );

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
            filterKey="email"
            columns={columns}
            data={data}
            onDelete={() => {}}
            disabled={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
