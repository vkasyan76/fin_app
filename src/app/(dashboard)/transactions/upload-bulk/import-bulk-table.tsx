"use client";

// Remove-Item -Recurse -Force node_modules
// Remove-Item -Force package-lock.json

// npm install @ag-grid-community/react@latest @ag-grid-community/core@latest @ag-grid-community/client-side-row-model@latest --legacy-peer-deps

// npm install ag-grid-community --legacy-peer-deps

import React, { useMemo } from "react";

// CHANGED: Using @ag-grid-community/react, not ag-grid-react
import { AgGridReact } from "@ag-grid-community/react";
import { ColDef, ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { IHeaderParams } from "@ag-grid-community/core";

// CHANGED: Import the standard styles from the new package
// import "@ag-grid-community/styles/ag-grid.css";
// import "@ag-grid-community/styles/ag-theme-alpine.css";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import { TableBulkHeadSelect } from "./table-bulk-head-select";

// CHANGED: Register the row model once so we can use 'clientSide' row model
ModuleRegistry.registerModules([ClientSideRowModelModule]);

// CHANGED: Define a more specific row type instead of `any`.
type RowCell = string | number | null | undefined;
type RowArray = RowCell[];

// CHANGED: Define a minimal or extended interface
// If you don't need AG Grid's IHeaderParams, you can omit it.
// But if you want the standard param fields, extend it like so:
interface CustomHeaderProps extends IHeaderParams {
  columnIndex: number;
  selectedColumns: Record<string, string | null>;
  onChange: (columnIndex: number, value: string | null) => void;
}

/**
 * We'll create a custom header component so we can display a React element
 * in the header. AG Grid's `headerName` must be a string, so we override
 * with `headerComponentFramework`.
 */
function CustomHeader(props: CustomHeaderProps) {
  const { columnIndex, selectedColumns, onChange } = props;
  return (
    <TableBulkHeadSelect
      columnIndex={columnIndex}
      selectedColumns={selectedColumns}
      onChange={onChange}
    />
  );
}

interface ImportBulkTableProps {
  headers: string[];
  rowData: RowArray[];
  selectedColumns: Record<string, string | null>;
  onTableHeadSelectChange: (columnIndex: number, value: string | null) => void;
}

export const ImportBulkTable = ({
  headers,
  rowData,
  selectedColumns,
  onTableHeadSelectChange,
}: ImportBulkTableProps) => {
  // Build column definitions
  const columnDefs = useMemo<ColDef[]>(() => {
    return headers.map((headerText, index) => ({
      // Use the CSV's first row as the displayed column name
      headerName: headerText || `Column ${index + 1}`,
      field: `col_${index}`,
      sortable: true,
      filter: true,
      resizable: true,

      // Our custom header with the <Select> component
      headerComponentFramework: CustomHeader,
      headerComponentParams: {
        columnIndex: index,
        selectedColumns,
        onChange: onTableHeadSelectChange,
        displayName: headerText, // pass the CSV header text to the custom header
      },
    }));
  }, [headers, selectedColumns, onTableHeadSelectChange]);

  // Convert each row array to an object
  const gridRowData = useMemo(() => {
    return rowData.map((row) => {
      const rowObj: Record<string, RowCell> = {};
      row.forEach((cell, idx) => {
        rowObj[`col_${idx}`] = cell;
      });
      return rowObj;
    });
  }, [rowData]);

  return (
    <div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
      <AgGridReact
        rowData={gridRowData}
        columnDefs={columnDefs}
        defaultColDef={{ resizable: true }}
      />
    </div>
  );
};
