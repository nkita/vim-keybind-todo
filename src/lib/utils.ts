import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}


export const debugLog = (...data: any) => {
  const flg = process.env.NEXT_PUBLIC_DEBUG
  if (flg === "true") console.log(...data)
}