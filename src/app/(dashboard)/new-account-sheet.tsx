"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AccountForm } from "./account-form";

export const NewAccountSheet = () => {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false); // Close the sheet on successful form submission
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>Create Account</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Create Account</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <AccountForm onSubmitSuccess={handleSuccess} />
        </div>
      </SheetContent>
    </Sheet>
  );
};
