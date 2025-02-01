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
import { CategoryForm } from "./category-form";
import { Plus } from "lucide-react";

export const NewCategorySheet = () => {
  // Use local state for NewCategorySheet (isOpen, setIsOpen) because it is self-contained.
  const [isOpen, setIsOpen] = useState(false);

  const onSubmit = () => {
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button size="sm">
          <Plus className="size-4 mr-1" />
          Add New
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="space-y-4">
        <SheetHeader>
          <SheetTitle>New Category</SheetTitle>
          <SheetDescription>
            Create a new category to track your items.
          </SheetDescription>
        </SheetHeader>
        <CategoryForm onSubmit={onSubmit} />
      </SheetContent>
    </Sheet>
  );
};
