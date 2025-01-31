"use client";

import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Trash } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Id } from "../../../../convex/_generated/dataModel";

type FormValues = {
  name: string;
};

type Props = {
  id?: Id<"accounts">;
  defaultValues?: FormValues;
  onSubmit: (values: FormValues) => void;
  disabled?: boolean;
  onDelete?: () => void; // Pass delete callback
};

export const AccountForm = ({
  id,
  defaultValues,
  onSubmit,
  disabled = false,
  onDelete,
}: Props) => {
  const form = useForm<FormValues>({
    defaultValues: {
      name: defaultValues?.name || "",
    },
  });

  const createAccount = useMutation(api.accounts.create);
  const updateAccount = useMutation(api.accounts.update);
  // const removeAccounts = useMutation(api.accounts.remove);

  const [isSubmitting, setIsSubmitting] = useState(false); // Track submission state

  const handleSubmit = async (values: FormValues) => {
    if (disabled || isSubmitting) return; // Prevent duplicate submissions
    setIsSubmitting(true);
    try {
      if (id) {
        await updateAccount({
          id, // must be a valid convex ID
          name: values.name.trim(),
        });
        toast.success("Account updated successfully!");
      } else {
        // Otherwise, create a new account
        await createAccount({
          name: values.name.trim(),
          plaidId: "",
        });
        toast.success("Account created successfully!");
      }
      onSubmit(values); // Trigger the passed onSubmit handler
    } catch (error) {
      console.error("Error creating account:", error);
      toast.error("Failed to create account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 pt-4"
      >
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled || isSubmitting}
                  placeholder="e.g., Cash, Bank, Credit Card"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          className="w-full"
          disabled={disabled || isSubmitting}
          type="submit"
        >
          {id ? "Save changes" : "Create account"}
        </Button>
        {!!id && (
          <Button
            type="button"
            disabled={disabled || isSubmitting}
            onClick={onDelete}
            className="w-full"
            variant="outline"
          >
            <Trash className="size-4 mr-2" />
            Delete account
          </Button>
        )}
      </form>
    </Form>
  );
};
