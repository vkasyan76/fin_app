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
import { AccountForm } from "./account-form";

type FormValues = {
  name: string;
};

export const NewAccountSheet = () => {
  const [isOpen, setIsOpen] = useState(false);

  const onSubmit = (values: FormValues) => {
    console.log("Form submitted:", values);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">Create Account</Button>
      </SheetTrigger>
      <SheetContent side="right" className="space-y-4">
        <SheetHeader>
          <SheetTitle>New Account</SheetTitle>
          <SheetDescription>
            Create a new account to track your transactions.
          </SheetDescription>
        </SheetHeader>
        <AccountForm onSubmit={onSubmit} />
      </SheetContent>
    </Sheet>
  );
};
