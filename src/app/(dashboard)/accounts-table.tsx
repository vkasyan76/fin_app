import { PaginationStatus } from "convex/react";
import { Doc } from "../../../convex/_generated/dataModel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoaderIcon } from "lucide-react";
import { AccountRow } from "./account-row";
import { Button } from "@/components/ui/button";

interface AccountsTableProps {
  accounts: Doc<"accounts">[] | undefined;
  loadMore: (numItems: number) => void;
  status: PaginationStatus;
}

export const AccountsTable = ({
  accounts,
  loadMore,
  status,
}: AccountsTableProps) => {
  return (
    <div className="max-w-screen-xl mx-auto px-16 py-6 flex flex-col gap-5">
      {/* If documents are still being fetched, show loading spinner */}
      {accounts === undefined ? (
        <div className="flex justify-center items-center h-24">
          <LoaderIcon className="animate-spin text-muted-foreground size-5" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-none">
              <TableHead>Name</TableHead>
              {/* Spacer column for alignment */}
              <TableHead>&nbsp;</TableHead>

              <TableHead className="hidden md:table-cell">Created at</TableHead>
            </TableRow>
          </TableHeader>

          {/* Conditional rendering for table body */}
          {accounts.length === 0 ? (
            <TableBody>
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  No documents found
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {/* Placeholder for actual document rows */}
              {accounts.map((account) => (
                <AccountRow key={account._id} account={account} />
              ))}
            </TableBody>
          )}
        </Table>
      )}

      {/* Load more button */}
      <div className="flex items-center justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => loadMore(5)}
          disabled={status !== "CanLoadMore"}
        >
          {status === "CanLoadMore" ? "Load more" : "End of results"}
        </Button>
      </div>
    </div>
  );
};
