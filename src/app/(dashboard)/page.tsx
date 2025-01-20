"use client";
// import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { usePaginatedQuery } from "convex/react";
import { useSearchParam } from "@/hooks/use-search-param";
import { Navbar } from "./navbar";
import { AccountsTable } from "./accounts-table";
import { CreateAccountDialog } from "./create-account-dialog";

export default function Home() {
  const [search] = useSearchParam();
  const { results, status, loadMore } = usePaginatedQuery(
    api.accounts.get,
    { search },
    { initialNumItems: 5 }
  );
  // const accounts = useQuery(api.accounts.get);

  // if (accounts === undefined) {
  //   return <p>Loading...</p>;
  // }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-10 h-16 bg-white p-4">
        <Navbar />
      </div>

      <div className="mt-16">
        <div className="max-w-screen-xl mx-auto px-16 my-8">
          <CreateAccountDialog />
        </div>
        <AccountsTable accounts={results} loadMore={loadMore} status={status} />
      </div>
    </div>
  );
}
