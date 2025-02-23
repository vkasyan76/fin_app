"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImportBulkTable } from "./import-bulk-table";
import { toast } from "sonner";
import { parse, isValid } from "date-fns";
import { detectDateFormat } from "@/lib/utils";

type RowCell = string | number | null | undefined;
type RowArray = RowCell[];

export interface ImportedTransactionRow {
  amount: number;
  payee: string;
  date: number;
  notes?: string;
  account?: string;
  category?: string;
}

interface SelectedColumnsState {
  [key: string]: string | null;
}

interface ImportBulkCardProps {
  data: RowArray[]; // entire CSV data, including first row
  onCancel: () => void;
  onSubmit: (formattedData: ImportedTransactionRow[]) => void;
}

const requiredOptions = ["amount", "payee", "date"];

export const ImportBulkCard = ({
  data,
  onCancel,
  onSubmit,
}: ImportBulkCardProps) => {
  const [selectedColumns, setSelectedColumns] = useState<SelectedColumnsState>(
    {}
  );

  // 1) Split out the first row as "headers," the rest as "body"
  const headers = data[0] || [];
  const body = data.slice(1);

  // Keep track of how many columns have a selection
  const progress = Object.values(selectedColumns).filter(
    (val) => val !== null
  ).length;

  const onTableHeadSelectChange = (
    columnIndex: number,
    value: string | null
  ) => {
    setSelectedColumns((prev) => {
      const newSelected = { ...prev };
      // Disallow the same field in multiple columns
      for (const key in newSelected) {
        if (newSelected[key] === value && key !== `column_${columnIndex}`) {
          newSelected[key] = null;
        }
      }
      newSelected[`column_${columnIndex}`] = value;
      return newSelected;
    });
  };

  const handleContinue = () => {
    // 1) For each column, see which field is assigned
    const mappedHeaders = headers.map(
      (_, index) => selectedColumns[`column_${index}`] || null
    );

    // 2) For each row, keep only the cells where we assigned a field
    const mappedBody = body.map((row) =>
      row.map((cell, index) =>
        selectedColumns[`column_${index}`] ? cell : null
      )
    );

    // 3) Convert each row into an object
    const arrayOfData = mappedBody.map((row) =>
      row.reduce((acc: Record<string, string | number>, cell, index) => {
        const field = mappedHeaders[index];
        if (
          field &&
          cell !== null &&
          cell !== undefined &&
          cell.toString().trim() !== ""
        ) {
          acc[field] = cell;
        }
        return acc;
      }, {})
    );

    // 4) Filter out empty rows
    const validArrayOfData = arrayOfData.filter(
      (row) => Object.keys(row).length > 0
    );

    // 5) Validate required fields
    for (const [i, item] of validArrayOfData.entries()) {
      for (const key of requiredOptions) {
        if (!item[key]) {
          toast.error(`Row ${i + 1} is missing required field: ${key}`);
          return;
        }
      }
    }

    // 6) Format each row for final usage
    const formattedData: ImportedTransactionRow[] = validArrayOfData
      .map((item) => {
        const amount = parseFloat(String(item.amount));
        const dateStr = String(item.date);
        const formatToUse = detectDateFormat(dateStr);
        if (!formatToUse) {
          toast.error(`Invalid date format: ${item.date}`);
          return null;
        }
        const parsedDate = parse(dateStr, formatToUse, new Date());
        if (!isValid(parsedDate)) {
          toast.error(`Invalid date: ${item.date}`);
          return null;
        }
        return {
          amount,
          payee: String(item.payee),
          date: parsedDate.getTime(),
          notes: item.notes ? String(item.notes) : undefined,
          account: item.account ? String(item.account) : undefined,
          category: item.category ? String(item.category) : undefined,
        };
      })
      .filter(Boolean) as ImportedTransactionRow[];

    // Debugging:
    console.log("Debugging in the import bulk card:");
    console.log("Mapped final arrayOfData:", validArrayOfData);
    console.log("Formatted data to import:", formattedData);

    onSubmit(formattedData);
  };

  return (
    <Card className="max-w-screen-2xl mx-auto w-full pb-10">
      <CardHeader className="flex flex-col lg:flex-row items-center justify-between">
        <CardTitle className="text-xl">Import Bulk Transactions</CardTitle>
        <div className="flex gap-2">
          <Button onClick={onCancel} size="sm">
            Cancel
          </Button>
          <Button
            onClick={handleContinue}
            size="sm"
            disabled={progress < requiredOptions.length}
          >
            Continue ({progress}/{requiredOptions.length})
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ImportBulkTable
          // 2) For the column definitions, we pass the *first row* as headers
          headers={headers.map(String)}
          // 3) For the actual data displayed in the grid, pass only the "body"
          rowData={body}
          selectedColumns={selectedColumns}
          onTableHeadSelectChange={onTableHeadSelectChange}
        />
      </CardContent>
    </Card>
  );
};
