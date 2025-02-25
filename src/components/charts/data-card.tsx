"use client";

import { useQuery } from "convex/react"; // Use Convex query hook
import { api } from "../../../convex/_generated/api";
import { Chart } from "./chart";

export const DataCharts = () => {
  const data = useQuery(api.summary.getSummary, {}); // Provide an empty object for optional parameters

  if (!data) {
    return <div>Loading...</div>; // Handle loading state properly
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
      <div className="col-span-1 lg:col-span-3 xl:col-span-4">
        <Chart data={data.days ?? []} />{" "}
        {/* Ensure data.days is not undefined */}
      </div>
    </div>
  );
};
