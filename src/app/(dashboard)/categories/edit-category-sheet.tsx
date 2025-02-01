"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CategoryForm } from "./category-form";
import { Id } from "../../../../convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "sonner";

type Props = {
  id: Id<"categories">;
  isOpen: boolean;
  onClose: () => void;
};

export const EditCategorySheet = ({ id, isOpen, onClose }: Props) => {
  const [defaultValues, setDefaultValues] = useState<{ name: string }>({
    name: "",
  });
  const categoryQuery = useQuery(api.categories.getById, { id });
  const removeCategories = useMutation(api.categories.remove);

  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete this category."
  );

  // New state for delete operation
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (categoryQuery) {
      setDefaultValues({ name: categoryQuery.name });
    }
  }, [categoryQuery]);

  const handleDelete = async () => {
    // If already deleting, return early.
    if (isDeleting) return;

    const confirmed = await confirm();
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      await removeCategories({ ids: [id] });
      toast.success("Category deleted successfully!");
      onClose(); // Close the sheet after deletion
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category.");
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
            <SheetTitle>Edit Category</SheetTitle>
            <SheetDescription>
              Edit the category details below.
            </SheetDescription>
          </SheetHeader>
          <CategoryForm
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
