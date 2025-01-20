import { TableCell, TableRow } from "@/components/ui/table";
import { SiGoogledocs } from "react-icons/si";
import { Doc } from "../../../convex/_generated/dataModel";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface AccountRowProps {
  account: Doc<"accounts">;
}

export const AccountRow = ({ account }: AccountRowProps) => {
  const router = useRouter();

  return (
    <TableRow
      // get redirected to the document:
      onClick={() => router.push(`/documents/${account._id}`)}
      className="cursor-pointer"
    >
      <TableCell className="w-[50px]">
        <SiGoogledocs className="size-6 fill-blue-500" />
      </TableCell>
      <TableCell className="font-medium md:w-[45%]">{account.name}</TableCell>
      <TableCell className="text-muted-foreground hidden md:table-cell">
        {format(new Date(account._creationTime), "MMM dd, yyyy")}
      </TableCell>
    </TableRow>
  );
};
