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
import { EditAccountSheet } from "./edit-account-sheet";
import { useConfirm } from "@/hooks/use-confirm";
import { useMutation } from "convex/react";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";

type Props = {
  id: Id<"accounts">; // Use the account ID type
};

export const Actions = ({ id }: Props) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const deleteMutation = useMutation(api.accounts.remove);

  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete this account."
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
      try {
        await deleteMutation({ ids: [id] });
        toast.success("Account deleted successfully!");
      } catch (error) {
        console.error("Error deleting account:", error);
        toast.error("Failed to delete account.");
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
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Trigger the edit account sheet */}
      <EditAccountSheet id={id} isOpen={isEditOpen} onClose={handleEditClose} />
    </>
  );
};
