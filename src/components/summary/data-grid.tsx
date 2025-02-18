"use client";

import { FaPiggyBank, FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react"; // Use Convex query hook
import { api } from "../../../convex/_generated/api";
import { formatDateRange } from "@/lib/utils";
import { DataCard, DataCardLoading } from "@/components/summary/data-card";

export const DataGrid = () => {
  const params = useSearchParams();
  const to = params.get("to") || undefined;
  const from = params.get("from") || undefined;

  // Fetch summary data using Convex API

  const data = useQuery(api.summary.getSummary, { from, to });

  // isLoading = true if data is undefined
  const isLoading = data === undefined;

  // Format date range
  const dateRangeLabel = formatDateRange({ from, to });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-2 mb-8">
        <DataCardLoading />
        <DataCardLoading />
        <DataCardLoading />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-2 mb-8">
      <DataCard
        title="Remaining"
        value={data?.remainingAmount || 0}
        percentageChange={data?.remainingChange || 0}
        icon={FaPiggyBank}
        variant="default"
        dateRange={dateRangeLabel}
      />
      <DataCard
        title="Income"
        value={data?.incomeAmount || 0}
        percentageChange={data?.incomeChange || 0}
        icon={FaArrowTrendUp}
        variant="success"
        dateRange={dateRangeLabel}
      />
      <DataCard
        title="Expenses"
        value={data?.expensesAmount || 0}
        percentageChange={data?.expensesChange || 0}
        icon={FaArrowTrendDown}
        variant="danger"
        dateRange={dateRangeLabel}
      />
    </div>
  );
};
