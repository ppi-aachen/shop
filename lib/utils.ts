import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatStockDisplay(stock: number): string {
  if (stock >= 5) {
    return ">5"
  } else if (stock >= 2 && stock <= 4) {
    return "<5"
  } else if (stock === 1) {
    return "1"
  } else {
    return "Out of stock"
  }
}
