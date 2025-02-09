"use client";

import { useState } from "react";
import { EditAccountSheet } from "@/app/(dashboard)/accounts/edit-account-sheet";
import { Id } from "../../../../convex/_generated/dataModel";

type Props = {
  account: string; // Name of the account
  accountId: Id<"accounts">; // ID of the account
};

export const AccountColumn = ({ account, accountId }: Props) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleOpenSheet = () => {
    setIsSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
  };

  return (
    <>
      <div
        onClick={handleOpenSheet}
        className="flex items-center cursor-pointer hover:underline"
      >
        {account}
      </div>
      <EditAccountSheet
        id={accountId}
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
      />
    </>
  );
};
