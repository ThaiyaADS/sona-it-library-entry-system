import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date/time string or Date object in Indian Standard Time (IST - Asia/Kolkata)
 */
export function formatInIST(
  date: Date | string | null | undefined,
  formatType: "date" | "time" | "timeWithSeconds" | "isoDate" | "weekdayDate" | "filenameDate"
): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";

  if (formatType === "date") {
    return d.toLocaleDateString("en-US", {
      timeZone: "Asia/Kolkata",
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  }

  if (formatType === "weekdayDate") {
    return d.toLocaleDateString("en-US", {
      timeZone: "Asia/Kolkata",
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }

  if (formatType === "isoDate") {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = formatter.formatToParts(d);
    const year = parts.find((p) => p.type === "year")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    return `${year}-${month}-${day}`;
  }

  if (formatType === "filenameDate") {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = formatter.formatToParts(d);
    const year = parts.find((p) => p.type === "year")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    return `${year}${month}${day}`;
  }

  if (formatType === "time") {
    return d.toLocaleTimeString("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  if (formatType === "timeWithSeconds") {
    return d.toLocaleTimeString("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }

  return d.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
}

/**
 * Calculate duration between entry and exit times based on IST-rounded minutes
 */
export function calculateISTDurationMinutes(entryTime: Date | string, exitTime: Date | string): number {
  const entryDate = typeof entryTime === "string" ? new Date(entryTime) : entryTime;
  const exitDate = typeof exitTime === "string" ? new Date(exitTime) : exitTime;
  
  if (isNaN(entryDate.getTime()) || isNaN(exitDate.getTime())) return 0;
  
  const entryIST = new Date(entryDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const exitIST = new Date(exitDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  
  entryIST.setSeconds(0, 0);
  exitIST.setSeconds(0, 0);
  
  const diffMs = exitIST.getTime() - entryIST.getTime();
  return Math.max(0, Math.round(diffMs / (1000 * 60)));
}
