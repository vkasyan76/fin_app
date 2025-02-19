"use client";

import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { format, isValid, parse } from "date-fns";
import { Actions } from "./actions";
import {
  detectDateFormat,
  formatCurrency,
  parseDateWithFallback,
} from "@/lib/utils";
import { AccountColumn } from "./account-column";
import { CategoryColumn } from "./category-column";

export type Transaction = {
  id: Id<"transactions">;
  account?: string;
  accountId: Id<"accounts">; // Add accountId here for the cell in the Account column
  category?: string | null; // Update to allow null values to match with transactions.ts;
  categoryId?: Id<"categories">; // make categoryId optional
  payee: string;
  amount: number;
  notes?: string;
  _creationTime: number;
};

export const columns: ColumnDef<Transaction>[] = [
  // Row Selection
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),

    cell: ({ row }) => {
      // const date = new Date(row.getValue("date"));
      // It correctly handles both numeric timestamps and date strings:
      const rawDate = row.getValue("date");
      if (!rawDate) {
        return <span className="text-gray-500">No Date</span>;
      }
      let date: Date | null = null;
      // If rawDate is a number, convert it directly.
      if (typeof rawDate === "number") {
        date = new Date(rawDate);
      }
      // If rawDate is a string, try to detect its format and parse.
      else if (typeof rawDate === "string") {
        const detectedFormat = detectDateFormat(rawDate);
        if (detectedFormat) {
          date = parse(rawDate, detectedFormat, new Date());
          if (!isValid(date)) {
            // If the initial parse is invalid, try the fallback.
            date = parseDateWithFallback(rawDate);
          }
          console.log(
            `Parsed Date: ${isValid(date) ? date?.toISOString() : "Invalid"} from ${rawDate}`
          );
        } else {
          // Use fallback parsing if format is not detected.
          date = parseDateWithFallback(rawDate);
        }
      }
      if (!date || !isValid(date)) {
        console.warn("Invalid date detected:", rawDate);
        return <span className="text-red-500">Invalid Date</span>;
      }

      return <span>{format(date, "MMM dd, yyyy")}</span>;
    },
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Category
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      return (
        <CategoryColumn
          transactionId={row.original.id}
          category={row.getValue("category")}
          categoryId={row.original.categoryId}
        />
      );
    },
  },
  {
    accessorKey: "account",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Account
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      return (
        <AccountColumn
          account={row.getValue("account")}
          accountId={row.original.accountId}
        />
      );
    },
  },
  {
    accessorKey: "payee",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Payee
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Amount
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      return (
        <Badge
          variant={amount < 0 ? "destructive" : "primary"}
          className="text-xs font-medium px-3.5 py-2.5"
        >
          {formatCurrency(amount)}
        </Badge>
      );
    },
  },

  {
    id: "actions",
    cell: ({ row }) => <Actions id={row.original.id} />, // Actions component for editing/deleting transactions
  },
];
