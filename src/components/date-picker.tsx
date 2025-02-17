import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { SelectSingleEventHandler } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const DatePicker = ({
  value,
  onChange,
  disabled,
}: {
  value: Date | undefined;
  onChange: SelectSingleEventHandler;
  disabled?: boolean;
}) => {
  // Fix for the Date Format Issue
  const locale = navigator.language || "en-US";
  const displayFormat =
    locale.startsWith("en-GB") || locale.startsWith("de")
      ? "dd/MM/yyyy"
      : "MM/dd/yyyy";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="size-4 mr-2" />
          {/* {value ? format(value, "PPP") : <span>Pick a date</span>} */}
          {value ? format(value, displayFormat) : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          disabled={disabled}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};
