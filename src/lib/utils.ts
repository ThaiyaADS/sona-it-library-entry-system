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

/**
 * Returns the Date object representing the start of the day in IST (Asia/Kolkata timezone)
 * converted back to UTC so it can be used directly in database queries.
 */
export function getISTStartOfDay(date: Date = new Date()): Date {
  const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
  const startOfDayIST = new Date(Date.UTC(
    istDate.getUTCFullYear(),
    istDate.getUTCMonth(),
    istDate.getUTCDate(),
    0, 0, 0, 0
  ));
  return new Date(startOfDayIST.getTime() - 5.5 * 60 * 60 * 1000);
}

/**
 * Returns the Date object representing the end of the day in IST (Asia/Kolkata timezone)
 * converted back to UTC so it can be used directly in database queries.
 */
export function getISTEndOfDay(date: Date = new Date()): Date {
  const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
  const endOfDayIST = new Date(Date.UTC(
    istDate.getUTCFullYear(),
    istDate.getUTCMonth(),
    istDate.getUTCDate(),
    23, 59, 59, 999
  ));
  return new Date(endOfDayIST.getTime() - 5.5 * 60 * 60 * 1000);
}

/**
 * Returns the Date object representing the start of the week in IST (Asia/Kolkata timezone)
 * converted back to UTC so it can be used directly in database queries.
 * Monday is treated as the first day of the week.
 */
export function getISTStartOfWeek(date: Date = new Date()): Date {
  const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
  const day = istDate.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const mondayUTCDate = new Date(Date.UTC(
    istDate.getUTCFullYear(),
    istDate.getUTCMonth(),
    istDate.getUTCDate() + diffToMonday,
    0, 0, 0, 0
  ));
  return new Date(mondayUTCDate.getTime() - 5.5 * 60 * 60 * 1000);
}

/**
 * Get the hour of the day (0-23) in IST for a given date.
 */
export function getISTHour(date: Date): number {
  const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
  return istDate.getUTCHours();
}

/**
 * Parse "YYYY-MM-DD" local filter input to start of day in IST.
 */
export function getISTStartOfDayFromFilter(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const utcMs = Date.UTC(year, month - 1, day, 0, 0, 0, 0);
  return new Date(utcMs - 5.5 * 60 * 60 * 1000);
}

/**
 * Parse "YYYY-MM-DD" local filter input to end of day in IST.
 */
export function getISTEndOfDayFromFilter(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const utcMs = Date.UTC(year, month - 1, day, 23, 59, 59, 999);
  return new Date(utcMs - 5.5 * 60 * 60 * 1000);
}

/**
 * Format a UTC Date into a "YYYY-MM-DDTHH:MM" string in IST timezone (suitable for datetime-local input).
 */
export function formatToISTDatetimeLocal(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  const istDate = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
  const year = istDate.getUTCFullYear();
  const month = String(istDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(istDate.getUTCDate()).padStart(2, "0");
  const hours = String(istDate.getUTCHours()).padStart(2, "0");
  const minutes = String(istDate.getUTCMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
