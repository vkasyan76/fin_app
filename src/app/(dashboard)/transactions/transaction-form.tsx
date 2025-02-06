"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Trash } from "lucide-react";
import { toast } from "sonner";
import { DatePicker } from "@/components/date-picker";
import { Select } from "@/components/select";
import { AmountInput } from "@/components/amount-input";

import { Id } from "../../../../convex/_generated/dataModel";
import Loader from "@/components/loader";

type FormValues = {
  accountId: Id<"accounts">; // From Select component
  categoryId?: Id<"categories">; // From Select component
  payee: string;
  amount: number;
  notes?: string;
  date?: Date;
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
      date: defaultValues?.date || undefined,
    },
  });

  const categoryQuery = useQuery(api.categories.getAll);
  const accountQuery = useQuery(api.accounts.getAll);

  const IsLoading = !categoryQuery || !accountQuery;

  // Map categories to options
  const categoryOptions = (categoryQuery ?? []).map((category) => ({
    label: category.name,
    value: category._id,
  }));

  // Map accounts to options
  const accountOptions = (accountQuery ?? []).map((account) => ({
    label: account.name,
    value: account._id,
  }));

  const createAccount = useMutation(api.accounts.create);
  const createCategory = useMutation(api.categories.create);

  const createTransaction = useMutation(api.transactions.create);
  const updateTransaction = useMutation(api.transactions.update);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: FormValues) => {
    if (disabled || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const formattedDate = values.date ? values.date.getTime() : Date.now();

      if (id) {
        await updateTransaction({
          id,
          payee: values.payee.trim(),
          amount: Number(values.amount),
          notes: values.notes?.trim(),
          accountId: values.accountId,
          categoryId: values.categoryId,
          date: formattedDate, // Pass formatted date
        });
        toast.success("Transaction updated successfully!");
      } else {
        await createTransaction({
          accountId: values.accountId,
          categoryId: values.categoryId,
          amount: Number(values.amount),
          payee: values.payee.trim(),
          notes: values.notes?.trim(),
          date: formattedDate, // Pass formatted date
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

  if (IsLoading) {
    return <Loader />;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 pt-4"
      >
        <FormField
          name="date"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value}
                  onChange={(date) => field.onChange(date)}
                  disabled={disabled || isSubmitting}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          name="accountId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account</FormLabel>
              <FormControl>
                <Select
                  options={accountOptions}
                  onCreate={async (name) => {
                    try {
                      // Create a new account using the create mutation
                      const newAccount = await createAccount({
                        name,
                        plaidId: "",
                      }); // Adjust arguments as needed
                      toast.success("Account created successfully!");
                      // Update the form field value with the new account ID
                      field.onChange(newAccount);
                    } catch (error) {
                      console.error("Error creating account:", error);
                      toast.error("Failed to create account.");
                    }
                  }}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled || isSubmitting}
                  placeholder="Select an account"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          name="categoryId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Select
                  options={categoryOptions}
                  onCreate={async (name) => {
                    try {
                      // Create a new category using the create mutation
                      const newCategory = await createCategory({ name });
                      toast.success("Category created successfully!");
                      // Update the form field value with the new category ID
                      field.onChange(newCategory);
                    } catch (error) {
                      console.error("Error creating category:", error);
                      toast.error("Failed to create category.");
                    }
                  }}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled || isSubmitting}
                  placeholder="Select a category"
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
                <AmountInput
                  {...field}
                  // type="number"
                  disabled={disabled || isSubmitting}
                  placeholder="0.00"
                />
              </FormControl>
            </FormItem>
          )}
        />

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
                  placeholder="Add a payee"
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
                <Textarea
                  {...field}
                  className="textarea-class" // Replace with your specific Tailwind class for textarea styling
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
