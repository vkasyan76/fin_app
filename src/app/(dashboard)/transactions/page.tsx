"use client";

import { api } from "../../../../convex/_generated/api";
import { useQuery } from "convex/react";
import { subDays } from "date-fns";
import type { Id } from "../../../../convex/_generated/dataModel";

export default function TransactionsPage() {
  // Example filters
  const accountIdString = "j573evzw0xdpk200awhf9b7xh979ep8a";
  // Cast the account ID string to the appropriate Convex ID type.
  const accountId = accountIdString as unknown as Id<"accounts">;
  const now = Date.now();
  const from = subDays(now, 30).getTime(); // Last 30 days
  const to = now; // Current time

  // Call the get query with the appropriate arguments
  const transactions = useQuery(api.transactions.get, {
    accountId: accountId, // Use undefined instead of null.
    from: from, // If undefined, the query will default to the last 30 days.
    to: to,
    paginationOpts: { numItems: 20, cursor: null }, // Use the expected pagination option.
  });

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

// export default function TransactionsPage() {
//   // Pass an empty object as the second argument.
//   const transactions = useQuery(api.transactions.get, {});

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
