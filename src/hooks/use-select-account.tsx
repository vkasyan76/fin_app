"use client";

import { useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select } from "@/components/select";

// Custom hook to select an account
export const useSelectAccount = (): [
  () => JSX.Element,
  () => Promise<string | undefined>,
] => {
  const [promise, setPromise] = useState<{
    resolve: (value: string | undefined) => void;
  } | null>(null);

  // Fetch all accounts associated with the user
  const accountQuery = useQuery(api.accounts.getAll);

  // Mutation to create a new account
  const createAccount = useMutation(api.accounts.create);

  // Store the selected account ID using useRef (to avoid re-renders)
  const selectValue = useRef<string | undefined>(undefined);

  // Function to show the selection dialog and return the selected account ID
  const confirm = () =>
    new Promise<string | undefined>((resolve) => setPromise({ resolve }));

  // Close the dialog
  const handleClose = () => {
    setPromise(null);
  };

  // Handle confirmation (resolve the promise with selected account)
  const handleConfirm = () => {
    promise?.resolve(selectValue.current);
    handleClose();
  };

  // Handle canceling (resolve with undefined)
  const handleCancel = () => {
    promise?.resolve(undefined);
    handleClose();
  };

  // Generate options from account query
  const accountOptions =
    accountQuery?.map((account) => ({
      label: account.name,
      value: account._id,
    })) ?? [];

  // The UI component to display the selection dialog
  const ConfirmationDialog = () => (
    <Dialog open={promise !== null} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Account</DialogTitle>
          <DialogDescription>
            Please select an account to continue.
          </DialogDescription>
        </DialogHeader>

        {/* Account selection dropdown */}
        <Select
          placeholder="Select an account"
          options={accountOptions}
          onCreate={async (name) => {
            const newAccount = await createAccount({ name, plaidId: "" });
            selectValue.current = newAccount;
          }}
          onChange={(value) => {
            selectValue.current = value;
          }}
          disabled={!accountQuery}
        />

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return [ConfirmationDialog, confirm];
};
