"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
// import { CreateAccountDialog } from "../(dashboard)/create-account-dialog";
// import { CreateAccountSheet } from "../(dashboard)/create_account-sheet";
import { NewAccountSheet } from "../(dashboard)/new-account-sheet";

export default function AccountsAPIPage() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.accounts.get,
    {},
    { initialNumItems: 5 }
  );

  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-screen-xl mx-auto px-16 py-6">
        <h1 className="text-2xl font-bold mb-4">Accounts</h1>
        <div className="space-y-4">
          {results?.map((account) => (
            <div
              key={account._id}
              className="border p-4 rounded bg-white shadow-sm"
            >
              <h2 className="text-lg font-semibold">{account.name}</h2>
              <p className="text-sm text-gray-600">
                Created at:{" "}
                {new Date(account._creationTime).toLocaleDateString()}
              </p>
            </div>
          ))}

          {status === "CanLoadMore" && (
            <button
              onClick={() => loadMore(5)}
              className="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Load more
            </button>
          )}
          {status !== "CanLoadMore" && results?.length > 0 && (
            <p className="text-center text-gray-500 mt-4">End of results</p>
          )}
        </div>
      </div>
      <div className="max-w-screen-xl mx-auto px-16 my-8">
        {/* <CreateAccountDialog /> */}
        {/* <CreateAccountSheet /> */}
        <NewAccountSheet />
      </div>
    </div>
  );
}
