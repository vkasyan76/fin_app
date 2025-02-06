"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TransactionForm } from "./transaction-form";

export const NewTransactionSheet = () => {
  const [isOpen, setIsOpen] = useState(false);

  const onSubmit = () => {
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add New
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="space-y-4">
        <SheetHeader>
          <SheetTitle>New Transaction</SheetTitle>
          <SheetDescription>Add a new transaction.</SheetDescription>
        </SheetHeader>
        <TransactionForm onSubmit={onSubmit} />
      </SheetContent>
    </Sheet>
  );
};
