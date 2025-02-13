"use client";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// like a notebook where we write down which column is used for what ||  selectedColumns is a dictionary.
// An individual select dropdown for one column, and it needs to:
// Read from selectedColumns to show the current selection.
// Call onChange(columnIndex, value) when a new selection is made.
type Props = {
  columnIndex: number;
  selectedColumns: Record<string, string | null>;
  onChange: (columnIndex: number, value: string | null) => void;
};

const options = ["amount", "payee", "date"];

export const TableHeadSelect = ({
  columnIndex,
  selectedColumns,
  onChange,
}: Props) => {
  //   returns a value from const options = ["amount", "payee", "date"], where column_${columnIndex}
  const currentSelection = selectedColumns[`column_${columnIndex}`];

  // The dropdown selection triggers onValueChange, which:
  // Passes the column index and selected value to onTableHeadSelectChange.
  // Updates the selectedColumns state in import-card.tsx.

  return (
    <Select
      value={currentSelection || ""}
      onValueChange={(value) => onChange(columnIndex, value)}
    >
      <SelectTrigger
        className={cn(
          "focus:ring-offset-0 focus:ring-transparent outline-none border-none bg-transparent capitalize",
          currentSelection && "text-blue-500"
        )}
      >
        <SelectValue placeholder="Skip" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="skip">Skip</SelectItem>
        {options.map((option, index) => {
          // Disable an option if it is already selected in another column
          // but allow re-selecting it in the current column
          const disabled =
            Object.values(selectedColumns).includes(option) &&
            selectedColumns[`column_${columnIndex}`] !== option;

          return (
            <SelectItem
              key={index}
              value={option}
              disabled={disabled}
              className="capitalize"
            >
              {option}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};
