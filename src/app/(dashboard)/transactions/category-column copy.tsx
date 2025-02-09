"use client";

import { useState } from "react";
import { EditCategorySheet } from "../categories/edit-category-sheet";
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
        // className="flex items-center cursor-pointer hover:underline"
        className={cn(
          "flex items-center cursor-pointer hover:underline",
          !categoryId && "text-rose-500"
        )}
      >
        {/* {!categoryId && <TriangleAlert className="mr-2 size-4 shrink-0" />} */}
        {category || "Uncategorized"}
      </div>
      {/* {categoryId && (
        <EditCategorySheet
          id={categoryId}
          isOpen={isSheetOpen}
          onClose={handleCloseSheet}
        />
      )} */}
      {categoryId ? (
        <EditCategorySheet
          id={categoryId}
          isOpen={isSheetOpen}
          onClose={handleCloseSheet}
        />
      ) : (
        <TriangleAlert className="mr-2 size-4 shrink-0" />
      )}
    </>
  );
};
