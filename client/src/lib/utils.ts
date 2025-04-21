import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, differenceInDays, isAfter, isBefore } from "date-fns";
import { ja } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to Japanese locale
export function formatDate(date: Date | string | number): string {
  const dateObj = typeof date === "string" || typeof date === "number" 
    ? new Date(date) 
    : date;
  return format(dateObj, "yyyy/MM/dd", { locale: ja });
}

// Format date with time
export function formatDateTime(date: Date | string | number): string {
  const dateObj = typeof date === "string" || typeof date === "number" 
    ? new Date(date) 
    : date;
  return format(dateObj, "yyyy/MM/dd HH:mm", { locale: ja });
}

// Get days left until deadline
export function getDaysUntil(date: Date | string | number): number {
  const dateObj = typeof date === "string" || typeof date === "number" 
    ? new Date(date) 
    : date;
  const today = new Date();
  return differenceInDays(dateObj, today);
}

// Check if a date is in the past
export function isPastDue(date: Date | string | number): boolean {
  const dateObj = typeof date === "string" || typeof date === "number" 
    ? new Date(date) 
    : date;
  return isBefore(dateObj, new Date());
}

// Task status utilities
export const TaskStatusMap = {
  NOT_STARTED: {
    label: "未着手",
    color: "bg-gray-100 text-gray-600",
    borderColor: "border-gray-400",
    taskClass: "task-not-started"
  },
  IN_PROGRESS: {
    label: "進行中",
    color: "bg-blue-100 text-primary",
    borderColor: "border-primary",
    taskClass: "task-in-progress"
  },
  COMPLETED: {
    label: "完了",
    color: "bg-green-100 text-success",
    borderColor: "border-success",
    taskClass: "task-completed"
  }
};

// Generate file icon based on file type
export function getFileIcon(fileType: string): string {
  if (fileType.includes('pdf')) {
    return "ri-file-pdf-line text-red-500";
  } else if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
    return "ri-file-excel-line text-green-600";
  } else if (fileType.includes('word') || fileType.includes('document')) {
    return "ri-file-word-line text-blue-600";
  } else if (fileType.includes('image')) {
    return "ri-image-line text-purple-500";
  } else {
    return "ri-file-line text-gray-500";
  }
}

// Format the days difference for display
export function formatDaysDifference(days: number): string {
  if (days < 0) {
    return `（${Math.abs(days)}日経過）`;
  } else {
    return `（あと${days}日）`;
  }
}
