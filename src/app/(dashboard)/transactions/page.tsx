"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { NewTransactionSheet } from "./new-transaction-sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { columns, Transaction } from "./columns";
import { DataTable } from "@/components/data-table";
import { Loader2 } from "lucide-react";
import { Row } from "@tanstack/react-table";

export default function TransactionsPage() {
  // Use an account ID filter if needed.
  const accountIdString = "j579ewsye92ntyw3z9yvmvdygx79e0eq";
  const accountId = accountIdString as unknown as Id<"accounts">;

  // Call the transactions get query (which returns an array).
  const transactions = useQuery(api.transactions.get, { accountId });
  console.log("Transactions:", transactions);

  // Set up the delete mutation.
  const deleteTransactions = useMutation(api.transactions.remove);

  // Map the transactions result into the shape our DataTable expects.
  const mappedResults = transactions?.map((tx) => ({
    id: tx.id as Id<"transactions">,
    payee: tx.payee,
    amount: tx.amount,
    notes: tx.notes,
    _creationTime: tx._creationTime,
  }));

  // Since our query returns all results, we use a no‑op for load more.
  const handleNextPage = () => {};
  const canLoadMore = false;

  const handleDelete = async (rows: Row<Transaction>[]) => {
    const ids = rows.map((row) => row.original.id);
    await deleteTransactions({ ids });
  };

  if (!transactions) {
    return (
      <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
        <Card className="border-none drop-shadow-sm">
          <CardHeader>
            <div className="h-8 w-48 bg-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="h-[500px] w-full flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-slate-300 animate-spin" />
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
            Transactions Page
          </CardTitle>
          <NewTransactionSheet />
        </CardHeader>
        <CardContent>
          <DataTable
            filterKey="payee"
            columns={columns}
            data={mappedResults || []}
            onDelete={handleDelete}
            onNextPage={handleNextPage}
            hasMore={canLoadMore}
            disabled={!transactions || transactions.length === 0}
          />
        </CardContent>
      </Card>
    </div>
  );
}
