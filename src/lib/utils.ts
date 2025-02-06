import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
