/**
 * Date parsing and range evaluation utilities for robust invoice filtering
 */

/**
 * Safely parses any date string (e.g. 'Oct 24, 2023', '2023-10-24', ISO strings) into a valid Date object
 */
export function parseDateSafe(dateInput: string | Date | undefined | null): Date | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) return isNaN(dateInput.getTime()) ? null : dateInput;

  const trimmed = String(dateInput).trim();
  if (!trimmed) return null;

  // Try standard Date parsing
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  // Try parsing YYYY-MM-DD
  const isoParts = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoParts) {
    const year = parseInt(isoParts[1], 10);
    const month = parseInt(isoParts[2], 10) - 1;
    const day = parseInt(isoParts[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  // Try parsing MM/DD/YYYY
  const usParts = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (usParts) {
    const month = parseInt(usParts[1], 10) - 1;
    const day = parseInt(usParts[2], 10);
    const year = parseInt(usParts[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  return null;
}

/**
 * Checks if a given date string falls between startDateStr and endDateStr (inclusive).
 * Dates can be formatted in ISO (YYYY-MM-DD) or human-readable format.
 */
export function isDateInRange(
  targetDateStr: string | undefined | null,
  startDateStr: string | undefined | null,
  endDateStr: string | undefined | null
): boolean {
  if (!targetDateStr) return false;
  const target = parseDateSafe(targetDateStr);
  if (!target) return true; // If unparseable, don't arbitrarily hide

  // Normalize target to midnight for date-only comparison
  const targetTime = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();

  if (startDateStr) {
    const start = parseDateSafe(startDateStr);
    if (start) {
      const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
      if (targetTime < startTime) return false;
    }
  }

  if (endDateStr) {
    const end = parseDateSafe(endDateStr);
    if (end) {
      const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999).getTime();
      if (targetTime > endTime) return false;
    }
  }

  return true;
}

/**
 * Helper to compute preset date ranges (e.g. 'this_month', 'last_30_days', 'last_90_days', 'this_year')
 */
export function getPresetDateRange(preset: string): { startDate: string; endDate: string } | null {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const toIso = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  switch (preset) {
    case 'today':
      return {
        startDate: toIso(today),
        endDate: toIso(today),
      };
    case 'yesterday': {
      const yest = new Date(today);
      yest.setDate(yest.getDate() - 1);
      return {
        startDate: toIso(yest),
        endDate: toIso(yest),
      };
    }
    case 'last_7_days': {
      const past = new Date(today);
      past.setDate(past.getDate() - 7);
      return {
        startDate: toIso(past),
        endDate: toIso(today),
      };
    }
    case 'this_month': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return {
        startDate: toIso(start),
        endDate: toIso(end),
      };
    }
    case 'last_month': {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      return {
        startDate: toIso(start),
        endDate: toIso(end),
      };
    }
    case 'this_quarter': {
      const currentQuarter = Math.floor(today.getMonth() / 3);
      const start = new Date(today.getFullYear(), currentQuarter * 3, 1);
      const end = new Date(today.getFullYear(), (currentQuarter + 1) * 3, 0);
      return {
        startDate: toIso(start),
        endDate: toIso(end),
      };
    }
    case 'last_30_days': {
      const past = new Date(today);
      past.setDate(past.getDate() - 30);
      return {
        startDate: toIso(past),
        endDate: toIso(today),
      };
    }
    case 'last_90_days': {
      const past = new Date(today);
      past.setDate(past.getDate() - 90);
      return {
        startDate: toIso(past),
        endDate: toIso(today),
      };
    }
    case 'this_year': {
      const start = new Date(today.getFullYear(), 0, 1);
      const end = new Date(today.getFullYear(), 11, 31);
      return {
        startDate: toIso(start),
        endDate: toIso(end),
      };
    }
    case 'last_year': {
      const start = new Date(today.getFullYear() - 1, 0, 1);
      const end = new Date(today.getFullYear() - 1, 11, 31);
      return {
        startDate: toIso(start),
        endDate: toIso(end),
      };
    }
    default:
      return null;
  }
}
