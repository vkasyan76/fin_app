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
  const accountId = accountIdString as unknown as Id<"accounts">;

  // Provide default pagination options.
  // Note: PaginationOptions must include at least a number of items.
  const paginationOpts = { numItems: 10, cursor: null };

  // Call the query passing the accountId and pagination options.
  const result = useQuery(api.transactions.getTransactions, {
    accountId,
    paginationOpts,
  });

  console.log("Result:", result);

  // While the query is loading, result will be undefined.
  if (!result) {
    return <div>Loading transactions...</div>;
  }

  // Destructure the paginated result.
  // Your query is expected to return an object with "page", "continueCursor", and "isDone".
  const { page, continueCursor, isDone } = result;

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-28">
      <h1>Transactions</h1>
      {/* You can log the entire result to inspect its structure */}
      <pre>{JSON.stringify(result, null, 2)}</pre>

      {/* List the transactions */}
      <ul>
        {page.map((tx) => (
          <li key={tx.id}>
            <strong>{tx.payee}</strong> — ${tx.amount}
            {tx.notes && <em> ({tx.notes})</em>}
          </li>
        ))}
      </ul>

      {/* Optionally, show a "Load More" button if there is more data */}
      {continueCursor && !isDone && (
        <button
          onClick={() => console.log("Load More functionality not implemented")}
        >
          Load More
        </button>
      )}
    </div>
  );
}

// export default function TransactionsPage() {
//   // Replace with your desired account ID string.
//   //   const accountIdString = "j573evzw0xdpk200awhf9b7xh979ep8a";
//   const accountIdString = "j579ewsye92ntyw3z9yvmvdygx79e0eq";
//   // Cast the string to the appropriate Convex ID type.
//   const accountId = accountIdString as unknown as Id<"accounts">;
//   // Pass an empty object as the second argument.
//   const transactions = useQuery(api.transactions.get, { accountId });

//   console.log(transactions);

//   if (!transactions) {
//     return <div>Loading transactions...</div>;
//   }

//   return (
//     <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-28">
//       <div>Transactions</div>
//       <pre>{JSON.stringify(transactions, null, 2)}</pre>
//     </div>
//   );
// }
