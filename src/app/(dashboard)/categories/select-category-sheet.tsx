"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Select } from "@/components/select";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";

type SelectCategorySheetProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectCategory: (id: string, name: string) => void;
};

export const SelectCategorySheet = ({
  isOpen,
  onOpenChange,
  onSelectCategory,
}: SelectCategorySheetProps) => {
  // Query for all categories (for the current user)
  const categories = useQuery(api.categories.getAll, {}) || [];
  const createCategory = useMutation(api.categories.create);

  // Map categories to options expected by your Select component.
  //eslint-disable-next-line
  const options = categories.map((cat: any) => ({
    label: cat.name,
    value: cat._id,
  }));

  // Local state for the selected category ID
  const [selected, setSelected] = useState<string | null>(null);

  const handleCreate = async (name: string) => {
    try {
      const newCategory = await createCategory({ name });
      toast.success("Category created successfully!");
      // Update state and trigger the onSelectCategory callback.
      setSelected(newCategory);
      onSelectCategory(newCategory, name);
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category.");
    }
  };

  const handleChange = (value: string) => {
    setSelected(value);
    // Look up the selected option to get its label.
    const selectedOption = options.find((option) => option.value === value);
    if (selectedOption) {
      onSelectCategory(value, selectedOption.label);
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="space-y-4">
        <SheetHeader>
          <SheetTitle>Select Category</SheetTitle>
          <SheetDescription>
            Choose an existing category or create a new one.
          </SheetDescription>
        </SheetHeader>
        <Select
          placeholder="Select a category"
          options={options}
          value={selected}
          onChange={handleChange}
          onCreate={handleCreate}
          disabled={false}
        />
      </SheetContent>
    </Sheet>
  );
};
