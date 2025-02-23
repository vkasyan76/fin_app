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
import { version } from "os";

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

// for transactions upload & for columns.tsx

/**
 * Detects the date format based on the provided date string.
 * Supports:
 * - European format with slashes: "dd/MM/yyyy HH:mm"
 * - American format with slashes: "MM/dd/yyyy HH:mm"
 * - European format with dots: "d.M.yyyy HH:mm" (supports both single and double digits)
 * - European format with full timestamp (dots with comma): "d.M.yyyy, HH:mm:ss"
 *
 * @param {string} dateString - The date string to detect.
 * @returns {string | null} - The detected format or null if unknown.
 *
 * version 1:
 */
// export function detectDateFormat(dateString: string): string | null {
//   if (!dateString || typeof dateString !== "string") {
//     return null;
//   }

//   // Match European format (slashes)
//   if (/^\d{1,2}\/\d{1,2}\/\d{4}(\s\d{2}:\d{2})?$/.test(dateString)) {
//     console.log(`Detected European format (slashes): ${dateString}`);
//     return "dd/MM/yyyy HH:mm";
//   }

//   // Match American format (slashes)
//   if (/^\d{1,2}\/\d{1,2}\/\d{4}(\s\d{2}:\d{2})?$/.test(dateString)) {
//     console.log(`Detected American format (slashes): ${dateString}`);
//     return "MM/dd/yyyy HH:mm";
//   }

//   // Match European format (dots), supports single or double digits for day/month
//   if (/^\d{1,2}\.\d{1,2}\.\d{4}(\s\d{2}:\d{2})?$/.test(dateString)) {
//     console.log(`Detected European format (dots): ${dateString}`);
//     return "d.M.yyyy HH:mm"; // Works for both "d.M.yyyy" and "dd.MM.yyyy"
//   }

//   // Match European format with full timestamp (dots with comma)
//   if (/^\d{1,2}\.\d{1,2}\.\d{4},\s\d{2}:\d{2}:\d{2}$/.test(dateString)) {
//     console.log(`Detected European format (dots with time): ${dateString}`);
//     return "d.M.yyyy, HH:mm:ss";
//   }

//   console.warn("Unknown date format:", dateString);
//   return null;
// }

// version 2:

// export function detectDateFormat(dateString: string): string | null {
//   if (!dateString || typeof dateString !== "string") {
//     return null;
//   }

//   // 1) Match slash-based date/time (e.g. "28/01/2025 21:35" or "01/28/2025 21:35")
//   //    We'll decide if it's dd/MM or MM/dd by checking if the first portion > 12.
//   // const slashRegex = /^\d{1,2}\/\d{1,2}\/\d{4}(\s\d{2}:\d{2})?$/;
//   // CHANGED: accept 2-digit or 4-digit year
//   const slashRegex = /^\d{1,2}\/\d{1,2}\/(\d{2}|\d{4})(\s\d{2}:\d{2})?$/;
//   if (slashRegex.test(dateString)) {
//     console.log(`Slash-based date/time detected: ${dateString}`);

//     // Extract the first number (day or month)
//     // e.g. "28/01/2025 21:35" => part1 = "28", part2 = "01"
//     const [datePart] = dateString.split(" "); // e.g. "28/01/2025"
//     const [part1] = datePart.split("/"); // e.g. "28"

//     const firstNum = parseInt(part1, 10);
//     if (firstNum > 12) {
//       // If firstNum is > 12, it's definitely a day => dd/MM/yyyy
//       console.log(`Assuming European (dd/MM/yyyy HH:mm): ${dateString}`);
//       return "dd/MM/yyyy HH:mm";
//     } else {
//       // Otherwise, assume American (MM/dd/yyyy)
//       console.log(`Assuming American (MM/dd/yyyy HH:mm): ${dateString}`);
//       return "MM/dd/yyyy HH:mm";
//     }
//   }

//   // 2) Match European format (dots), supports single or double digits for day/month
//   //    e.g. "28.01.2025 21:35" or "1.1.2025 21:35"
//   if (/^\d{1,2}\.\d{1,2}\.\d{4}(\s\d{2}:\d{2})?$/.test(dateString)) {
//     console.log(`Detected European format (dots): ${dateString}`);
//     return "d.M.yyyy HH:mm"; // Works for both "d.M.yyyy" and "dd.MM.yyyy"
//   }

//   // 3) Match European format with full timestamp (dots + comma + seconds)
//   //    e.g. "28.01.2025, 21:35:59"
//   if (/^\d{1,2}\.\d{1,2}\.\d{4},\s\d{2}:\d{2}:\d{2}$/.test(dateString)) {
//     console.log(`Detected European format (dots with time): ${dateString}`);
//     return "d.M.yyyy, HH:mm:ss";
//   }

//   console.warn("Unknown date format:", dateString);
//   return null;
// }

// version 3:
// export function detectDateFormat(dateString: string): string | null {
//   if (!dateString || typeof dateString !== "string") {
//     return null;
//   }

//   // Regex for slash-based dates that allow 2-digit or 4-digit years
//   const slashRegex = /^\d{1,2}\/\d{1,2}\/(\d{2}|\d{4})(\s\d{2}:\d{2})?$/;
//   if (slashRegex.test(dateString)) {
//     // Split the date to decide if it's dd/MM or MM/dd.
//     const [firstPart] = dateString.split("/");
//     const firstNum = parseInt(firstPart, 10);
//     // If first number > 12, it's likely day-first (European), else month-first (American)
//     if (firstNum > 12) {
//       // If time is provided, include it in the format string
//       return dateString.includes(" ") ? "dd/MM/yy HH:mm" : "dd/MM/yy";
//     } else {
//       return dateString.includes(" ") ? "MM/dd/yy HH:mm" : "MM/dd/yy";
//     }
//   }

//   // Existing patterns for dot-based formats
//   if (/^\d{1,2}\.\d{1,2}\.\d{4}(\s\d{2}:\d{2})?$/.test(dateString)) {
//     console.log(`Detected European format (dots): ${dateString}`);
//     return "d.M.yyyy HH:mm";
//   }
//   if (/^\d{1,2}\.\d{1,2}\.\d{4},\s\d{2}:\d{2}:\d{2}$/.test(dateString)) {
//     console.log(`Detected European format (dots with time): ${dateString}`);
//     return "d.M.yyyy, HH:mm:ss";
//   }

//   console.warn("Unknown date format:", dateString);
//   return null;
// }

// version 4:
export function detectDateFormat(dateString: string): string | null {
  if (!dateString || typeof dateString !== "string") {
    return null;
  }
  // Regex for slash-based dates capturing day, month, and year
  const slashRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})(\s\d{2}:\d{2})?$/;
  const match = dateString.match(slashRegex);
  if (match) {
    const firstToken = parseInt(match[1], 10); // could be day or month
    const yearPart = match[3];
    // If the first number is > 12, we assume it's day-first (European)
    if (firstToken > 12) {
      return dateString.includes(" ")
        ? `dd/MM/${yearPart.length === 4 ? "yyyy" : "yy"} HH:mm`
        : `dd/MM/${yearPart.length === 4 ? "yyyy" : "yy"}`;
    } else {
      return dateString.includes(" ")
        ? `MM/dd/${yearPart.length === 4 ? "yyyy" : "yy"} HH:mm`
        : `MM/dd/${yearPart.length === 4 ? "yyyy" : "yy"}`;
    }
  }
  // Dot-based date formats remain unchanged
  if (/^\d{1,2}\.\d{1,2}\.\d{4}(\s\d{2}:\d{2})?$/.test(dateString)) {
    return dateString.includes(" ") ? "d.M.yyyy HH:mm" : "d.M.yyyy";
  }
  if (/^\d{1,2}\.\d{1,2}\.\d{4},\s\d{2}:\d{2}:\d{2}$/.test(dateString)) {
    return "d.M.yyyy, HH:mm:ss";
  }
  console.warn("Unknown date format:", dateString);
  return null;
}

/**
 * Attempts to parse the given date string using a list of possible formats.
 * Returns the parsed Date if successful, or null otherwise.
 *
 * @param {string} dateString - The date string to parse.
 * @returns {Date | null}
 */
export function parseDateWithFallback(dateString: string): Date | null {
  const possibleFormats = [
    "dd/MM/yyyy HH:mm",
    "dd/MM/yyyy",
    "MM/dd/yyyy HH:mm",
    "MM/dd/yyyy",
    "d.M.yyyy HH:mm",
    "d.M.yyyy",
    "d.M.yyyy, HH:mm:ss",
    "yyyy-MM-dd HH:mm:ss",
  ];

  for (const fmt of possibleFormats) {
    const parsed = parse(dateString, fmt, new Date());
    if (isValid(parsed)) {
      console.log(`Parsed using fallback format ${fmt}: ${dateString}`);
      return parsed;
    }
  }
  console.warn("Fallback failed for date:", dateString);
  return null;
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
