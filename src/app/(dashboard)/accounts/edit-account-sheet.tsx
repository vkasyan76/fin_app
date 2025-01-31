"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
// import { Button } from "@/components/ui/button";
import { AccountForm } from "./account-form";
import { Id } from "../../../../convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "sonner";

type Props = {
  id: Id<"accounts">;
  isOpen: boolean;
  onClose: () => void;
};

export const EditAccountSheet = ({ id, isOpen, onClose }: Props) => {
  const [defaultValues, setDefaultValues] = useState<{ name: string }>({
    name: "",
  });
  const accountQuery = useQuery(api.accounts.getById, { id });
  const removeAccounts = useMutation(api.accounts.remove);

  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete this account."
  );

  useEffect(() => {
    if (accountQuery) {
      setDefaultValues({ name: accountQuery.name });
    }
  }, [accountQuery]);

  const handleDelete = async () => {
    const confirmed = await confirm();
    if (!confirmed) return;

    try {
      await removeAccounts({ ids: [id] });
      toast.success("Account deleted successfully!");
      onClose(); // Close the sheet after deletion
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account.");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="space-y-4">
          <SheetHeader>
            <SheetTitle>Edit Account</SheetTitle>
            <SheetDescription>Edit the account details below.</SheetDescription>
          </SheetHeader>
          <AccountForm
            onSubmit={onClose}
            defaultValues={defaultValues}
            id={id}
            // onClose={onClose} // Pass onClose to AccountForm
            onDelete={handleDelete} // Pass handleDelete
          />
        </SheetContent>
      </Sheet>
    </>
  );
};
