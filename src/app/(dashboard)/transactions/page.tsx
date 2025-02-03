"use client";

import { api } from "../../../../convex/_generated/api";
import { useQuery } from "convex/react";
import type { Id } from "../../../../convex/_generated/dataModel";

export default function TransactionsPage() {
  // Define the transaction ID you want to log.
  const transactionIdString = "jd7e8d4hs12jnr03fprgerxn6179j21w";
  // Cast the string to the appropriate Convex ID type.
  const transactionId = transactionIdString as unknown as Id<"transactions">;

  // Call the query with the transaction ID.
  const transaction = useQuery(api.transactions.getById, {
    id: transactionId,
  });

  // Log the transaction data (it may be undefined until the query loads).
  console.log("Transaction:", transaction);

  // Replace with your desired account ID string.
  const accountIdString = "j579ewsye92ntyw3z9yvmvdygx79e0eq";
  // Cast the string to the appropriate Convex ID type.
  const accountId = accountIdString as unknown as Id<"accounts">; // Call the query passing the accountId and pagination options.

  const result = useQuery(api.transactions.get, {
    accountId,
  });

  console.log("Result:", result);

  // While the query is loading, result will be undefined.
  if (!result) {
    return <div>Loading transactions...</div>;
  }

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-28">
      <h1>Transactions</h1>
      {/* Log the entire result for debugging */}
      <pre>{JSON.stringify(result, null, 2)}</pre>

      {/* List the transactions */}
      <ul>
        {result.map((tx) => (
          <li key={tx.id}>
            <strong>{tx.payee}</strong> — ${tx.amount}
            {tx.notes && <em> ({tx.notes})</em>}
          </li>
        ))}
      </ul>
    </div>
  );
}
