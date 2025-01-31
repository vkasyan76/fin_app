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
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

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
  // const updateAccount = useMutation(api.accounts.update);

  useEffect(() => {
    if (accountQuery) {
      setDefaultValues({ name: accountQuery.name });
    }
  }, [accountQuery]);

  if (!isOpen) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="space-y-4">
        <SheetHeader>
          <SheetTitle>Edit Account</SheetTitle>
          <SheetDescription>Edit the account details below.</SheetDescription>
        </SheetHeader>
        <AccountForm onSubmit={onClose} defaultValues={defaultValues} id={id} />
      </SheetContent>
    </Sheet>
  );
};
