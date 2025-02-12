"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { NewTransactionSheet } from "./new-transaction-sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { columns, Transaction } from "./columns";
import { DataTable } from "./data-table-transactions";
import { Loader2 } from "lucide-react";
import { Row } from "@tanstack/react-table";
import { useState } from "react";
import { UploadButton } from "./upload/upload-button";
import { ImportCard } from "./upload/import-card";

// Enum for handling different views (list or import mode)
enum VARIANTS {
  LIST = "LIST",
  IMPORT = "IMPORT",
}

// Initial state for import results
const INITIAL_IMPORT_RESULTS = {
  data: [],
  errors: [],
  meta: {},
};

export default function TransactionsPage() {
  // Call the transactions get query (fetching all transactions, no account filter).
  const transactions = useQuery(api.transactions.get, { accountId: undefined });
  // Set up the delete mutation.
  const deleteTransactions = useMutation(api.transactions.remove);
  // console.log("Transactions:", transactions);
  // Handle CSV upload results
  const [variant, setVariant] = useState<VARIANTS>(VARIANTS.LIST);
  const [importResults, setImportResults] = useState(INITIAL_IMPORT_RESULTS);

  const onUpload = (results: typeof INITIAL_IMPORT_RESULTS) => {
    console.log("Results:", results);
    setImportResults(results);
    setVariant(VARIANTS.IMPORT);
  };

  // Handle canceling the import process
  const onCancelImport = () => {
    setImportResults(INITIAL_IMPORT_RESULTS);
    setVariant(VARIANTS.LIST);
  };

  // Map the transactions result into the shape our DataTable expects.
  const mappedResults = transactions?.map((tx) => ({
    id: tx.id as Id<"transactions">,
    payee: tx.payee,
    account: tx.account ?? undefined, // because we want to change the account in the columns
    accountId: tx.accountId,
    category: tx.category,
    categoryId: tx.categoryId,
    amount: tx.amount,
    notes: tx.notes,
    _creationTime: tx._creationTime, // Include this field
    date: new Date(tx.date).toLocaleDateString(), // Format the date
  }));

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

  if (variant === VARIANTS.IMPORT) {
    return (
      <>
        <ImportCard
          data={importResults.data}
          onCancel={onCancelImport}
          onSubmit={() => {}}
        />
      </>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-28">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">
            Transaction History
          </CardTitle>
          <div className="flex flex-col lg:flex-row gap-y-2 items-center gap-x-2">
            <NewTransactionSheet />
            <UploadButton onUpload={onUpload} />
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            filterKey="payee"
            columns={columns}
            data={mappedResults || []}
            onDelete={handleDelete}
            disabled={!transactions || transactions.length === 0}
          />
        </CardContent>
      </Card>
    </div>
  );
}
