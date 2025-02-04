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
  payee: string;
  amount: number;
  notes?: string;
};

type Props = {
  id?: Id<"transactions">;
  defaultValues?: FormValues;
  onSubmit: (values: FormValues) => void;
  disabled?: boolean;
  onDelete?: () => void;
};

export const TransactionForm = ({
  id,
  defaultValues,
  onSubmit,
  disabled = false,
  onDelete,
}: Props) => {
  const form = useForm<FormValues>({
    defaultValues: {
      payee: defaultValues?.payee || "",
      amount: defaultValues?.amount || 0,
      notes: defaultValues?.notes || "",
    },
  });

  const createTransaction = useMutation(api.transactions.create);
  const updateTransaction = useMutation(api.transactions.update);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: FormValues) => {
    if (disabled || isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (id) {
        await updateTransaction({
          id, // must be a valid convex ID for transactions
          // Note: In our transactions.update mutation we expect these fields.
          // In a more complete form you might also allow the user to update accountId or categoryId,
          // but here we update only payee, amount, and notes.
          payee: values.payee.trim(),
          amount: Number(values.amount), // convert to a number
          notes: values.notes?.trim(),
          // For simplicity, we assume accountId and categoryId remain unchanged.
          // If needed, you could pass them in as hidden fields or via defaultValues.
          accountId:
            "j579ewsye92ntyw3z9yvmvdygx79e0eq" as unknown as Id<"accounts">, // Replace with a valid account ID if available.
          categoryId: undefined,
        });
        toast.success("Transaction updated successfully!");
      } else {
        await createTransaction({
          // For creating a transaction you need to supply accountId.
          // Here we hardcode a dummy accountId—replace it with the actual account context.
          accountId:
            "j579ewsye92ntyw3z9yvmvdygx79e0eq" as unknown as Id<"accounts">,
          categoryId: undefined,
          amount: Number(values.amount),
          payee: values.payee.trim(),
          notes: values.notes?.trim(),
        });
        toast.success("Transaction created successfully!");
      }
      onSubmit(values);
    } catch (error) {
      console.error("Error submitting transaction:", error);
      toast.error("Failed to submit transaction.");
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
          name="payee"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payee</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled || isSubmitting}
                  placeholder="e.g., Starbucks"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="amount"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  disabled={disabled || isSubmitting}
                  placeholder="e.g., 15.99"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="notes"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled || isSubmitting}
                  placeholder="Optional notes"
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
          {id ? "Save changes" : "Create transaction"}
        </Button>
        {!!id && (
          <Button
            type="button"
            disabled={disabled || isSubmitting}
            onClick={onDelete}
            className="w-full"
            variant="outline"
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete transaction
          </Button>
        )}
      </form>
    </Form>
  );
};
