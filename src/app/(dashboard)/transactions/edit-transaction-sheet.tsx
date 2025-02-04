"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TransactionForm } from "./transaction-form";
import { Id } from "../../../../convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "sonner";

type Props = {
  id: Id<"transactions">;
  isOpen: boolean;
  onClose: () => void;
};

export const EditTransactionSheet = ({ id, isOpen, onClose }: Props) => {
  // For transactions, our default values include payee, amount, and notes.
  const [defaultValues, setDefaultValues] = useState<{
    payee: string;
    amount: number;
    notes?: string;
  }>({
    payee: "",
    amount: 0,
    notes: "",
  });

  // Use the transactions getById query.
  const transactionQuery = useQuery(api.transactions.getById, { id });
  // Use the transactions remove mutation.
  const removeTransactions = useMutation(api.transactions.remove);

  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete this transaction."
  );

  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (transactionQuery) {
      setDefaultValues({
        payee: transactionQuery.payee,
        amount: transactionQuery.amount,
        notes: transactionQuery.notes,
      });
    }
  }, [transactionQuery]);

  const handleDelete = async () => {
    if (isDeleting) return;
    const confirmed = await confirm();
    if (!confirmed) return;
    setIsDeleting(true);
    try {
      await removeTransactions({ ids: [id] });
      toast.success("Transaction deleted successfully!");
      onClose();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="space-y-4">
          <SheetHeader>
            <SheetTitle>Edit Transaction</SheetTitle>
            <SheetDescription>
              Edit the transaction details below.
            </SheetDescription>
          </SheetHeader>
          <TransactionForm
            onSubmit={onClose}
            defaultValues={defaultValues}
            id={id}
            onDelete={handleDelete}
          />
        </SheetContent>
      </Sheet>
    </>
  );
};
