"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TableBulkHeadSelectProps {
  columnIndex: number;
  selectedColumns: Record<string, string | null>;
  onChange: (columnIndex: number, value: string | null) => void;
}

// Options now include extra fields (e.g. account and category)
const options = [
  "skip",
  "amount",
  "payee",
  "date",
  "account",
  "category",
  "notes",
];

export const TableBulkHeadSelect = ({
  columnIndex,
  selectedColumns,
  onChange,
}: TableBulkHeadSelectProps) => {
  const currentSelection = selectedColumns[`column_${columnIndex}`] || "skip";

  return (
    <Select
      value={currentSelection}
      onValueChange={(value) =>
        onChange(columnIndex, value === "skip" ? null : value)
      }
    >
      <SelectTrigger
        className={cn(
          "bg-transparent",
          currentSelection !== "skip" && "text-blue-500"
        )}
      >
        <SelectValue placeholder="Skip" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option, index) => (
          <SelectItem
            key={index}
            value={option}
            disabled={
              option !== "skip" &&
              Object.values(selectedColumns).includes(option) &&
              selectedColumns[`column_${columnIndex}`] !== option
            }
          >
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
