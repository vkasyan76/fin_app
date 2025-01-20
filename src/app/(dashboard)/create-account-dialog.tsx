"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export const CreateAccountDialog = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [plaidId, setPlaidId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const createAccount = useMutation(api.accounts.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Account name is required!");
      return;
    }
    setIsCreating(true);
    try {
      await createAccount({ name: name.trim(), plaidId: plaidId.trim() });
      toast.success("Account created successfully!");
      setName("");
      setPlaidId("");
      setOpen(false);
    } catch (error) {
      console.error("Error creating account:", error);
      toast.error("Failed to create account.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Button to trigger the dialog */}
      <DialogTrigger asChild>
        <Button>Create Account</Button>
      </DialogTrigger>

      {/* Dialog Content */}
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Account</DialogTitle>
            <DialogDescription>
              Enter the details for the new account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="mt-3">
              <Label htmlFor="name" className="block text-sm font-medium">
                Account Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter account name"
              />
            </div>
            <div>
              <Label htmlFor="plaidId" className="block text-sm font-medium">
                Plaid ID (optional)
              </Label>
              <Input
                id="plaidId"
                value={plaidId}
                onChange={(e) => setPlaidId(e.target.value)}
                placeholder="Enter Plaid ID"
              />
            </div>
          </div>
          <div className="mt-3">
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                disabled={isCreating}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
