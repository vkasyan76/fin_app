"use client";

import { useState } from "react";
import { EditCategorySheet } from "../categories/edit-category-sheet";
import { NewCategorySheet } from "../categories/new-category-sheet";
import { Id } from "../../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { TriangleAlert } from "lucide-react";

type Props = {
  category: string | null; // Allow null, if there is no category name
  categoryId?: Id<"categories">; // Make this optional
};

export const CategoryColumn = ({ category, categoryId }: Props) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleOpenSheet = () => {
    // setIsSheetOpen(true);
    // Only open the sheet if a category ID exists.
    if (categoryId) {
      setIsSheetOpen(true);
    }
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
  };

  return (
    <>
      <div
        onClick={handleOpenSheet}
        className={cn(
          "flex items-center cursor-pointer hover:underline text-rose-500",
          !categoryId && "text-rose-500"
        )}
      >
        <TriangleAlert className="mr-2 h-4 w-4" />
        <span>{category || "Uncategorized"}</span>
      </div>
      {categoryId ? (
        <EditCategorySheet
          id={categoryId}
          isOpen={isSheetOpen}
          onClose={handleCloseSheet}
        />
      ) : (
        <NewCategorySheet
          hideTrigger
          isOpen={isSheetOpen}
          onOpenChange={handleCloseSheet}
        />
      )}
    </>
  );
};
