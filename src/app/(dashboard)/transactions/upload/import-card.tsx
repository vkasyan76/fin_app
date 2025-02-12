"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImportTable } from "./import-table";
import { useState } from "react";

const dateFormat = "yyyy-MM-dd HH:mm:ss";
const outputFormat = "yyyy-MM-dd";

const requiredOptions = ["amount", "date", "payee"];

interface SelectedColumnsState {
  [key: string]: string | null;
}

interface Props {
  data: string[][];
  onCancel: () => void;
  /* eslint-disable-next-line */
  onSubmit: (data: any) => void;
}

export const ImportCard = ({ data, onCancel, onSubmit }: Props) => {
  const [selectedColumns, setSelectedColumns] = useState<SelectedColumnsState>(
    {}
  );

  const headers = data[0];
  const body = data.slice(1);

  // Function to track column selection progress - for continue button
  const progress = Object.values(selectedColumns).filter(Boolean).length;

  // method for setting selected columns in the table head:
  const onTableHeadSelectChange = (
    columnIndex: number,
    value: string | null
  ) => {
    // Creates a copy of the previous selected columns state.
    setSelectedColumns((prev) => {
      const newSelectedColumns = { ...prev };

      // Reset the previous selection if the same value was chosen elsewhere
      for (const key in newSelectedColumns) {
        if (newSelectedColumns[key] === value) {
          newSelectedColumns[key] = null;
        }
      }

      // If "skip" is selected, set the value to null
      if (value === "skip") {
        value = null;
      }

      // Assign the selected value to the respective column
      newSelectedColumns[`column_${columnIndex}`] = value;

      return newSelectedColumns;
    });
  };

  return (
    <Card className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
        <CardTitle className="text-xl line-clamp-1">
          Import Transaction
        </CardTitle>
        <div className="flex flex-col lg:flex-row gap-y-2 items-center gap-x-2">
          <Button onClick={onCancel} size="sm" className="w-full lg:w-auto">
            Cancel
          </Button>
          {/* Continue Button */}
          <Button
            size="sm"
            disabled={progress < requiredOptions.length} // Disabled if not all required fields are selected
            onClick={() => onSubmit(selectedColumns)}
            className="w-full lg:w-auto"
          >
            Continue ({progress}/{requiredOptions.length})
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ImportTable
          headers={headers}
          body={body}
          selectedColumns={selectedColumns}
          onTableHeadSelectChange={onTableHeadSelectChange}
        />
      </CardContent>
    </Card>
  );
};
