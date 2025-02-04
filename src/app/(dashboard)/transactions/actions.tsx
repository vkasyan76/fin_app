"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Trash } from "lucide-react";

import { useConfirm } from "@/hooks/use-confirm";
import { useMutation } from "convex/react";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";
import { EditTransactionSheet } from "./edit-transaction-sheet"; // Updated import

type Props = {
  id: Id<"transactions">;
};

export const Actions = ({ id }: Props) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const deleteMutation = useMutation(api.transactions.remove);

  const [isDeletePending, setIsDeletePending] = useState(false);

  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete this transaction."
  );

  const handleEdit = () => {
    setIsEditOpen(true);
  };

  const handleEditClose = () => {
    setIsEditOpen(false);
  };

  const handleDelete = async () => {
    const confirmed = await confirm();
    if (confirmed) {
      setIsDeletePending(true);
      try {
        await deleteMutation({ ids: [id] });
        toast.success("Transaction deleted successfully!");
      } catch (error) {
        console.error("Error deleting transaction:", error);
        toast.error("Failed to delete transaction.");
      } finally {
        setIsDeletePending(false);
      }
    }
  };

  return (
    <>
      <ConfirmDialog />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="size-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleEdit} disabled={isDeletePending}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} disabled={isDeletePending}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Trigger the edit transaction sheet */}
      <EditTransactionSheet
        id={id}
        isOpen={isEditOpen}
        onClose={handleEditClose}
      />
    </>
  );
};
