"use client";

import { api } from "../../../convex/_generated/api";
import { usePaginatedQuery } from "convex/react";
import { AccountsTable } from "./accounts-table";
import { useSearchParam } from "@/hooks/use-search-param";

export default function Home() {
  const [search] = useSearchParam();
  const { results, status, loadMore } = usePaginatedQuery(
    api.accounts.get,
    { search },
    { initialNumItems: 5 }
  );

  return (
    <div>
      <AccountsTable accounts={results} loadMore={loadMore} status={status} />
    </div>
  );
}
