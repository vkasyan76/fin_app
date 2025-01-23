"use client";

import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";

interface AccountFormProps {
  initialName?: string;
  onSubmitSuccess?: () => void;
}

interface FormData {
  name: string;
}

export const AccountForm = ({
  initialName = "",
  onSubmitSuccess,
}: AccountFormProps) => {
  const { handleSubmit, control, formState } = useForm<FormData>({
    defaultValues: { name: initialName },
  });

  const createAccount = useMutation(api.accounts.create);

  const onSubmit = async (data: FormData) => {
    if (!data.name.trim()) {
      toast.error("Account name is required!");
      return;
    }

    try {
      await createAccount({ name: data.name.trim(), plaidId: "" });
      toast.success("Account created successfully!");
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (error) {
      console.error("Error saving account:", error);
      toast.error("Failed to save account.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="name" className="block text-sm font-medium">
          Account Name
        </Label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="name"
              placeholder="Enter account name"
              className="mt-2"
            />
          )}
        />
        {formState.errors.name && (
          <p className="text-red-500 text-sm mt-1">
            {formState.errors.name.message}
          </p>
        )}
      </div>
      <div className="flex justify-end space-x-4">
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};
