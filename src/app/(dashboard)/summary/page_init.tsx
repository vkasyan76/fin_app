"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function SummaryPage() {
  const [accountId, setAccountId] = useState<Id<"accounts"> | undefined>(
    undefined
  );
  const [from, setFrom] = useState<string | undefined>(undefined);
  const [to, setTo] = useState<string | undefined>(undefined);

  // Fetch financial summary using the Convex query
  const summary = useQuery(api.transactions.getSummary, {
    accountId,
    from,
    to,
  });

  // Fetch category-wise spending summary
  const categorySummary = useQuery(api.transactions.getCategorySummary, {
    accountId,
    from,
    to,
  });

  if (!summary || !categorySummary) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-6 w-6 text-gray-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-screen-lg mx-auto w-full pb-10">
      <Card className="border-none drop-shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Current Period */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Current Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Income:{" "}
                <strong>${summary.currentPeriod.income.toFixed(2)}</strong>
              </p>
              <p>
                Expenses:{" "}
                <strong>${summary.currentPeriod.expenses.toFixed(2)}</strong>
              </p>
              <p>
                Remaining:{" "}
                <strong>${summary.currentPeriod.remaining.toFixed(2)}</strong>
              </p>
            </CardContent>
          </Card>

          {/* Last Period */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Last Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Income: <strong>${summary.lastPeriod.income.toFixed(2)}</strong>
              </p>
              <p>
                Expenses:{" "}
                <strong>${summary.lastPeriod.expenses.toFixed(2)}</strong>
              </p>
              <p>
                Remaining:{" "}
                <strong>${summary.lastPeriod.remaining.toFixed(2)}</strong>
              </p>
            </CardContent>
          </Card>

          {/* Percentage Changes */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Percentage Changes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Income Change:{" "}
                <strong>
                  {summary.percentageChanges.incomeChange.toFixed(2)}%
                </strong>
              </p>
              <p>
                Expenses Change:{" "}
                <strong>
                  {summary.percentageChanges.expensesChange.toFixed(2)}%
                </strong>
              </p>
              <p>
                Remaining Change:{" "}
                <strong>
                  {summary.percentageChanges.remainingChange.toFixed(2)}%
                </strong>
              </p>
            </CardContent>
          </Card>

          {/* Category Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Top Spending Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              {categorySummary.finalCategories.length > 0 ? (
                <ul>
                  {categorySummary.finalCategories.map((category, index) => (
                    <li key={index} className="mb-2">
                      <strong>{category.name}:</strong> $
                      {category.value.toFixed(2)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No spending categories available.</p>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
