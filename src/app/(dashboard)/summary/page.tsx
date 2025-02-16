"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SummaryPage() {
  const [accountId, setAccountId] = useState<Id<"accounts"> | undefined>(
    undefined
  );
  const [from, setFrom] = useState<string | undefined>(undefined);
  const [to, setTo] = useState<string | undefined>(undefined);

  // Fetch financial summary using the Convex query
  const response = useQuery(api.summary.getSummary, { accountId, from, to });
  const data = response?.data; // Extracting the 'data' field

  useEffect(() => {
    if (data?.days) {
      console.log("Daily Spend Data:", data.days);
    }
  }, [data]);

  if (!data) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin h-6 w-6 text-gray-500" />
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
          <Card className="p-4">
            <CardHeader className="font-semibold text-lg">
              Last Period
            </CardHeader>
            <CardContent>
              <div>Income: ${data?.incomeAmount?.toFixed(2)}</div>
              <div>Expenses: ${data?.expensesAmount?.toFixed(2)}</div>
              <div>Remaining: ${data?.remainingAmount?.toFixed(2)}</div>
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
                Income Change: <strong>{data.incomeChange.toFixed(2)}%</strong>
              </p>
              <p>
                Expenses Change:{" "}
                <strong>{data.expensesChange.toFixed(2)}%</strong>
              </p>
              <p>
                Remaining Change:{" "}
                <strong>{data.remainingChange.toFixed(2)}%</strong>
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
              {data.categories.length > 0 ? (
                <ul>
                  {data?.categories?.map(
                    (
                      category: { id: string; name: string; value: number },
                      index: number
                    ) => (
                      <li key={category.id}>
                        {index + 1}. {category.name}: $
                        {category.value.toFixed(2)}
                      </li>
                    )
                  )}
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
