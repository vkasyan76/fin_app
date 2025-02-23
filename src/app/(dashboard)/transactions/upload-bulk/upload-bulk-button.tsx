"use client";

import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

// CHANGED: More explicit row type
type RowCell = string | number | null | undefined;
type RowArray = RowCell[];

interface UploadBulkButtonProps {
  onUpload: (results: RowArray[]) => void;
}

export const UploadBulkButton = ({ onUpload }: UploadBulkButtonProps) => {
  const handleFileUpload = async (file: File) => {
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (fileExtension === "csv") {
      // CHANGED: parse CSV
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === "string") {
          Papa.parse(text, {
            complete: (results) => {
              onUpload(results.data as RowArray[]);
            },
          });
        }
      };
      reader.readAsText(file);
    } else if (fileExtension === "xlsx" || fileExtension === "xls") {
      // CHANGED: parse Excel
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        // const workbook = XLSX.read(data, { type: "array" });
        // CHANGED: pass some extra options so XLSX converts numeric cells to date strings
        const workbook = XLSX.read(data, {
          type: "array",
          cellDates: true, // parse numeric dates into Date objects
          dateNF: "mm/dd/yyyy HH:mm",
          // ^ picks the desired output format for date/time (adjust as needed).
          //   e.g. "dd/MM/yyyy HH:mm:ss" if you want seconds,
          //   or "MM/dd/yyyy HH:mm" if you prefer US style.
        });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        // const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        // CHANGED: raw: false => convert date cells to strings using dateNF
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          raw: false,
        });
        onUpload(jsonData as RowArray[]);
      };
      reader.readAsArrayBuffer(file);
    } else {
      console.error("Unsupported file format");
    }
  };

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, []);

  return (
    <Button size="sm" className="w-full lg:w-auto">
      <label className="flex items-center cursor-pointer">
        <Upload className="mr-2" />
        Import Bulk
        <input
          type="file"
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          onChange={onFileChange}
          className="hidden"
        />
      </label>
    </Button>
  );
};
