"use client";

import { api } from "../../../../convex/_generated/api";
import { useQuery } from "convex/react";
import type { Id } from "../../../../convex/_generated/dataModel";

export default function TransactionsPage() {
  // Replace with your desired account ID string.
  //   const accountIdString = "j573evzw0xdpk200awhf9b7xh979ep8a";
  const accountIdString = "j579ewsye92ntyw3z9yvmvdygx79e0eq";
  // Cast the string to the appropriate Convex ID type.
  const accountId = accountIdString as unknown as Id<"accounts">;
  // Pass an empty object as the second argument.
  const transactions = useQuery(api.transactions.get, { accountId });

  console.log(transactions);

  if (!transactions) {
    return <div>Loading transactions...</div>;
  }

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-28">
      <div>Transactions</div>
      <pre>{JSON.stringify(transactions, null, 2)}</pre>
    </div>
  );
}
