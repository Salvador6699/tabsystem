import { useState } from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Error saving to localStorage:", e);
  }
}

export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() =>
    getFromStorage(key, defaultValue)
  );

  const setValue = (value: T) => {
    setState(value);
    saveToStorage(key, value);
  };

  return [state, setValue];
}

export function formatCurrency(value: number): string {
  return `${value.toFixed(2)}€`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-ES");
}
