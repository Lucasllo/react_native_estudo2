// Date utilities with timezone support

import { differenceInHours, format, isFuture, isToday, parseISO, startOfDay } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { ptBR } from "date-fns/locale";

const TIMEZONE = process.env.VITE_TIMEZONE || "America/Fortaleza";

/**
 * Format date in timezone
 */
export function formatDateTZ(dateISO: string, formatStr: string = "dd/MM/yyyy"): string {
  try {
    const date = parseISO(dateISO);
    const zonedDate = toZonedTime(date, TIMEZONE);
    return format(zonedDate, formatStr, { locale: ptBR });
  } catch {
    return "";
  }
}

/**
 * Format relative time (Hoje, Amanhã, date)
 */
export function formatRelativeDate(dateISO: string): string {
  try {
    const date = parseISO(dateISO);
    const zonedDate = toZonedTime(date, TIMEZONE);

    if (isToday(zonedDate)) {
      return "Hoje";
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (format(zonedDate, "yyyy-MM-dd") === format(tomorrow, "yyyy-MM-dd")) {
      return "Amanhã";
    }

    return format(zonedDate, "dd/MM");
  } catch {
    return "";
  }
}

/**
 * Check if date is in the past
 */
// src/utils/date.ts
export function isDatePast(dateISO: string): boolean {
  try {
    const date = parseISO(dateISO);
    const today = startOfDay(new Date()); // ← Zera hora/minuto/segundo
    const itemDate = startOfDay(date);

    return itemDate < today; // ← Compara apenas DATAS
  } catch {
    return false;
  }
}

/**
 * Check if date is in the future
 */
export function isDateFuture(dateISO: string): boolean {
  try {
    const date = parseISO(dateISO);
    return isFuture(date);
  } catch {
    return false;
  }
}

/**
 * Check if deadline is within 48 hours
 */
export function isUrgentDeadline(dateISO: string): boolean {
  try {
    const date = parseISO(dateISO);
    const now = new Date();
    const hoursDiff = differenceInHours(date, now);
    return hoursDiff > 0 && hoursDiff <= 48;
  } catch {
    return false;
  }
}

/**
 * Convert date to timezone
 */
export function toTZ(date: Date): Date {
  return toZonedTime(date, TIMEZONE);
}

/**
 * Convert date from timezone
 */
export function fromTZ(date: Date): Date {
  return fromZonedTime(date, TIMEZONE);
}

/**
 * Check if deadline is within specified hours (urgent)
 * @param prazoISO - ISO 8601 date string of the deadline
 * @param horasLimite - Hour threshold (e.g., 24 for next 24 hours)
 * @returns true if deadline is within the hour limit and in the future
 */
export function isPrazoProximo(prazoISO: string, horasLimite: number = 24): boolean {
  try {
    const prazo = parseISO(prazoISO);
    const now = new Date();
    const hoursDiff = differenceInHours(prazo, now);
    return hoursDiff > 0 && hoursDiff <= horasLimite;
  } catch {
    return false;
  }
}