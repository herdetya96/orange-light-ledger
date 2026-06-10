export type Period = "1M" | "3M" | "6M" | "1Y";

export const PERIODS: Period[] = ["1M", "3M", "6M", "1Y"];

export function periodStart(period: Period, now = new Date()): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  switch (period) {
    case "1M": d.setMonth(d.getMonth() - 1); break;
    case "3M": d.setMonth(d.getMonth() - 3); break;
    case "6M": d.setMonth(d.getMonth() - 6); break;
    case "1Y": d.setFullYear(d.getFullYear() - 1); break;
  }
  return d;
}

export function previousPeriodStart(period: Period, now = new Date()): Date {
  const start = periodStart(period, now);
  const span = now.getTime() - start.getTime();
  return new Date(start.getTime() - span);
}

export function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}
