import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  eachDayOfInterval,
  isSameDay,
  parse,
  isValid,
  format,
  subDays,
} from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// amount to show to the user
export function convertAmountFromMilliunits(amount: number) {
  return amount / 1000;
}

// amount to store in the database
export function convertAmountToMilliunits(amount: number) {
  return Math.round(amount * 1000);
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

// for fin summary

export function calculatePercentageChange(current: number, previous: number) {
  if (previous === 0) {
    return previous === current ? 0 : 100;
  }

  return ((current - previous) / previous) * 100;
}

// for the chart - to have 0 for missing days

export function fillMissingDays(
  activeDays: { date: Date; income: number; expenses: number }[],
  startDate: Date,
  endDate: Date
) {
  // If there are no active days, return an empty array
  if (activeDays.length === 0) {
    return [];
  }

  // Create an array with all the days between startDate and endDate
  const allDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  // Iterate over all the days and check if we have data for them
  const transactionsByDay = allDays.map((day) => {
    // Find an existing entry in activeDays for this specific date
    const found = activeDays.find((d) => isSameDay(d.date, day));

    // If we found data for this day, return it; otherwise, return a default object
    return found
      ? found
      : {
          date: day,
          income: 0,
          expenses: 0,
        };
  });

  return transactionsByDay;
}

// for transactions upload
/**
 * Detects the date format based on the provided date string.
 * Supports:
 * - European format: `dd/MM/yyyy HH:mm`
 * - American format: `MM/dd/yyyy HH:mm`
 *
 * @param {string} dateString - The date string to detect.
 * @returns {string | null} - The detected format or null if unknown.
 */
export function detectDateFormat(dateString: string): string | null {
  if (!dateString || typeof dateString !== "string") {
    return null;
  }

  // Check for European format (dd/MM/yyyy HH:mm)
  if (/^\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}$/.test(dateString)) {
    return "dd/MM/yyyy HH:mm";
  }

  // Check for American format (MM/dd/yyyy HH:mm)
  if (/^\d{1,2}\/\d{1,2}\/\d{4}\s\d{2}:\d{2}$/.test(dateString)) {
    return "MM/dd/yyyy HH:mm";
  }

  console.warn("Unknown date format:", dateString);
  return null; // Return null if format is unknown
}

// formatDateRange Function for the summary:

type Period = {
  from: string | Date | undefined;
  to: string | Date | undefined;
};

export function formatDateRange(period?: Period) {
  const defaultTo = new Date();
  const defaultFrom = subDays(defaultTo, 30);

  if (!period?.from) {
    return `${format(defaultFrom, "LLL dd")} - ${format(defaultTo, "LLL dd, y")}`;
  }

  if (period.to) {
    return `${format(period.from, "LLL dd")} - ${format(period.to, "LLL dd, y")}`;
  }

  return format(period.from, "LLL dd, y");
}

// formatPercentage Function

export function formatPercentage(
  value: number,
  options: { addPrefix?: boolean } = { addPrefix: false }
) {
  const result = new Intl.NumberFormat("en-US", {
    style: "percent",
  }).format(value / 100);

  if (options.addPrefix && value > 0) {
    return `+${result}`;
  }

  return result;
}
