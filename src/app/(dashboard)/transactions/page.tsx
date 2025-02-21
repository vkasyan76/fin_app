"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { Transaction as TransactionType } from "../../../../convex/transactions";
import { NewTransactionSheet } from "./new-transaction-sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { columns, Transaction } from "./columns";
import { DataTable } from "./data-table-transactions";
import { Loader2 } from "lucide-react";
import { Row } from "@tanstack/react-table";
import { useState } from "react";
import { UploadButton } from "./upload/upload-button";
import { ImportCard } from "./upload/import-card";
import { useSelectAccount } from "@/hooks/use-select-account";
import { toast } from "sonner";

import { UploadBulkButton } from "./upload-bulk/upload-bulk-button";
import {
  ImportBulkCard,
  ImportedTransactionRow,
} from "./upload-bulk/import-bulk-card";

// Enum for handling different views (list or import mode)
enum VARIANTS {
  LIST = "LIST",
  IMPORT = "IMPORT",
  IMPORT_BULK = "IMPORT_BULK",
}

// Initial state for import results
const INITIAL_IMPORT_RESULTS = {
  data: [],
  errors: [],
  meta: {},
};

// For bulk upload: A single cell can be a string, number, null, or undefined
type RowCell = string | number | null | undefined;

// CHANGED: A single row is an array of cells
type RowArray = RowCell[];

export default function TransactionsPage() {
  // Account Select Dialog for Bulk Upload
  const [AccountDialog, confirm] = useSelectAccount();

  // Call the transactions get query (fetching all transactions, no account filter).
  const transactions = useQuery(api.transactions.get, { accountId: undefined });
  // Set up the delete mutation.
  const deleteTransactions = useMutation(api.transactions.remove);
  // console.log("Transactions:", transactions);

  const CreateTransactions = useMutation(api.transactions.bulkCreate);
  // CHANGED: For creating new accounts/categories if needed
  const createAccount = useMutation(api.accounts.create);
  const createCategory = useMutation(api.categories.create);

  // 1) We'll fetch all accounts/categories once
  const existingAccounts = useQuery(api.accounts.getAll) || [];
  const existingCategories = useQuery(api.categories.getAll) || [];

  // Handle CSV upload results
  const [variant, setVariant] = useState<VARIANTS>(VARIANTS.LIST);
  const [importResults, setImportResults] = useState(INITIAL_IMPORT_RESULTS);

  const onUpload = (results: typeof INITIAL_IMPORT_RESULTS) => {
    console.log("Results:", results);
    setImportResults(results);
    setVariant(VARIANTS.IMPORT);
  };

  // CHANGED: State for storing the raw 2D array from CSV/Excel
  const [bulkImportData, setBulkImportData] = useState<RowArray[]>([]);

  // CHANGED: Called when the user picks a CSV/Excel file
  const onUploadBulk = (data: RowArray[]) => {
    console.log("Bulk Upload Data:", data);
    setBulkImportData(data);
    setVariant(VARIANTS.IMPORT_BULK);
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

  const onSubmitImport = async (
    formattedData: Omit<TransactionType, "_id" | "_creationTime" | "userId">[]
  ) => {
    console.log("Opening Select Account Dialog...");
    // Ask the user to confirm and select an account
    const accountId = await confirm();

    if (!accountId) {
      toast.error("Please select an account to continue.");
      return;
    }

    // Ensure the data follows the expected `TransactionType` structure
    //Omit<Type, Keys> is a TypeScript utility type that creates a new type by removing specified properties (Keys) from an existing Type.
    const data: Omit<TransactionType, "_id" | "_creationTime" | "userId">[] =
      formattedData.map((item) => ({
        accountId: accountId as Id<"accounts">,
        categoryId: item.categoryId as Id<"categories"> | undefined,
        amount: item.amount, // Convert to number
        payee: String(item.payee), // Ensure it's a string
        notes: item.notes ? String(item.notes) : undefined,
        date: item.date, // Already a timestamp from `handleContinue`
      }));

    try {
      // Call the Convex mutation to create transactions in bulk
      await CreateTransactions({ transactions: data });

      // Reset the import state after successful import
      onCancelImport();
      toast.success("Transactions imported successfully!");
    } catch (error) {
      console.error("Error importing transactions:", error);
      toast.error("Failed to import transactions.");
    }
  };

  // For the bulk import, process each row. If an account or category name is provided,
  // create it (or use existing logic to check) and then call the bulkCreate mutation.

  const onSubmitBulkImport = async (
    formattedData: ImportedTransactionRow[]
  ) => {
    try {
      // 2) Build a name → ID map for accounts
      const accountMap = new Map<string, Id<"accounts">>();
      for (const acct of existingAccounts) {
        // e.g. { _id: "abcd123...", name: "Bank" }
        accountMap.set(acct.name.toLowerCase(), acct._id);
      }

      // Build a name → ID map for categories
      const categoryMap = new Map<string, Id<"categories">>();
      for (const cat of existingCategories) {
        categoryMap.set(cat.name.toLowerCase(), cat._id);
      }

      // 3) For each row, find or create account/category
      const processedData = await Promise.all(
        formattedData.map(async (item) => {
          // account is required, so if item.account is missing, throw or skip
          if (!item.account) {
            throw new Error(
              `No account provided for row with payee=${item.payee}`
            );
          }

          // Check if we already have an account with that name
          const accountKey = item.account.toLowerCase();
          let accountId = accountMap.get(accountKey);
          if (!accountId) {
            // 4) If not found, create a new one
            accountId = await createAccount({
              name: item.account,
              plaidId: item.account,
            });
            // store it in the map for future rows
            accountMap.set(accountKey, accountId);
          }

          // categories are optional, so only if item.category is present
          let categoryId: Id<"categories"> | undefined;
          if (item.category) {
            const categoryKey = item.category.toLowerCase();
            categoryId = categoryMap.get(categoryKey);
            if (!categoryId) {
              categoryId = await createCategory({ name: item.category });
              categoryMap.set(categoryKey, categoryId);
            }
          }

          // Return the final transaction object
          return {
            accountId, // definitely set now
            categoryId, // possibly undefined
            amount: item.amount,
            payee: item.payee,
            notes: item.notes,
            date: item.date,
          };
        })
      );

      // 5) Insert them all at once
      await CreateTransactions({ transactions: processedData });
      toast.success("Bulk transactions imported successfully!");
      setVariant(VARIANTS.LIST);
    } catch (error) {
      console.error("Error importing bulk transactions:", error);
      toast.error("Failed to import bulk transactions.");
    }
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
        <AccountDialog />
        <ImportCard
          data={importResults.data}
          onCancel={onCancelImport}
          onSubmit={onSubmitImport}
        />
      </>
    );
  }

  if (variant === VARIANTS.IMPORT_BULK) {
    return (
      <>
        <ImportBulkCard
          data={bulkImportData}
          onCancel={() => setVariant(VARIANTS.LIST)}
          onSubmit={onSubmitBulkImport}
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
          <div className="flex flex-col w-full gap-2 lg:flex-row lg:w-auto">
            <NewTransactionSheet />
            <UploadButton onUpload={onUpload} />
            <UploadBulkButton onUpload={onUploadBulk} />
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
