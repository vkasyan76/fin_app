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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export const CreateAccountSheet = () => {
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>Create Account</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <form onSubmit={handleSubmit} className="space-y-6">
          <SheetHeader>
            <SheetTitle>Create Account</SheetTitle>
            <SheetDescription>
              Create an account to track your transactions.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="block text-sm font-medium">
                Account Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter account name"
                className="mt-2"
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
                className="mt-2"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-4 mt-4">
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
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
