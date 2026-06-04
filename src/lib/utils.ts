import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDuration = (duration: number) => {
  const seconds = Math.floor((duration % 60000) / 1000);
  // vd: duration = 125000 ms => 125000 % 60000 = 5000 => 5000 / 1000 = 5 seconds

  const minutes = Math.floor(duration / 60000);

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

export const snakeCaseToTitle = (str: string) => {
  return str.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}