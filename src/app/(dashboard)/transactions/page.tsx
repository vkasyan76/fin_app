"use client";

import { api } from "../../../../convex/_generated/api";
import { useQuery } from "convex/react";

export default function TransactionsPage() {
  // Pass an empty object as the second argument.
  const transactions = useQuery(api.transactions.get, {});

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
