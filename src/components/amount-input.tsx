import CurrencyInput from "react-currency-input-field";
import { Info, MinusCircle, PlusCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  value: string | number; // Allow both string and number
  // value: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
};

// Helper: Parse the input value according to the browser's locale.
const parseLocaleNumber = (value: string | undefined): number => {
  if (!value) return 0;
  const locale = navigator.language || "en-US";
  const formatter = new Intl.NumberFormat(locale);
  // Determine the decimal separator (either '.' or ',')
  const decimalSeparator = formatter.format(1.1).replace(/\d/g, "");
  // Remove any non-digit/decimal characters and convert locale-specific separator to '.'
  const normalizedValue = value
    .replace(new RegExp(`[^0-9${decimalSeparator}-]`, "g"), "")
    .replace(decimalSeparator, ".");
  return parseFloat(normalizedValue);
};

// adjust the component to work with both string and number values:
export const AmountInput = ({
  value,
  onChange,
  placeholder,
  disabled,
}: Props) => {
  // Ensure `value` is always treated as a string for the input field - initial version
  // const stringValue = typeof value === "number" ? value.toFixed(2) : value;
  // const parsedValue = parseFloat(stringValue || "0");

  // Convert the value into a properly formatted number using the browser's locale

  const stringValue = typeof value === "number" ? value.toFixed(2) : value;
  const parsedValue = parseLocaleNumber(stringValue);

  const isIncome = parsedValue > 0;
  const isExpense = parsedValue < 0;

  const onReverseValue = () => {
    if (!value) return;
    // const newValue = parseFloat(value) * -1;
    const newValue = parsedValue * -1;
    onChange(newValue.toString());
  };

  return (
    <div className="relative">
      <TooltipProvider>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onReverseValue}
              className={cn(
                "bg-slate-400 hover:bg-slate-500 absolute top-1.5 left-1 rounded-md p-2 flex items-center justify-center transition",
                isIncome && "bg-emerald-500 hover:bg-emerald-600",
                isExpense && "bg-rose-500 hover:bg-rose-600"
              )}
            >
              {parsedValue === 0 && <Info className="size-3 text-white" />}
              {isIncome && <PlusCircle className="size-3 text-white" />}
              {isExpense && <MinusCircle className="size-3 text-white" />}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            Use [+] for income and [-] for expenses
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <CurrencyInput
        //   this class matches input component, but has pl-10
        prefix="$"
        className="pl-10 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        placeholder={placeholder}
        value={value}
        decimalsLimit={2}
        decimalScale={2}
        onValueChange={onChange}
        // onBlur normalizes the value on losing focus.
        onBlur={(e) => {
          const currentValue = e.target.value;
          const normalized = parseLocaleNumber(currentValue);
          onChange(normalized.toFixed(2));
        }}
        disabled={disabled}
      />
      <p className="text-xs text-muted-foreground mt-2">
        {isIncome && "This will count as income"}
        {isExpense && "This will count as an expense"}
      </p>
    </div>
  );
};
