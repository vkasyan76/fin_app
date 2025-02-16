import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { eachDayOfInterval, isSameDay } from "date-fns";

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
