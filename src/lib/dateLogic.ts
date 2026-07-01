// Core date-comparison engine.
// Implements the rules from Sales_Dashboard_Logic_Summary.md:
//  - all timestamps are unix seconds -> convert to IST calendar date (no time component)
//  - "today" = latest date in data, or a user-picked "as of" date
//  - week = Monday-Sunday
//  - WoW / MoM always compare an EQUAL number of days (never partial vs full)

const IST_OFFSET_MIN = 5 * 60 + 30 // IST = UTC+5:30

/** Convert a raw OMS Guru unix-seconds timestamp into a calendar date string (YYYY-MM-DD) in IST. */
export function unixToISTDateString(unixSeconds: number | string): string {
  const seconds =
    typeof unixSeconds === 'string' ? parseInt(unixSeconds, 10) : unixSeconds
  if (!seconds || Number.isNaN(seconds)) return ''
  const utcMs = seconds * 1000
  const istMs = utcMs + IST_OFFSET_MIN * 60 * 1000
  const d = new Date(istMs)
  // Use the UTC getters since we've already shifted the clock by the IST offset manually.
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
/** Extract the IST hour (0-23) from a unix-seconds timestamp. */
export function unixToISTHour(unixSeconds: number | string): number {
  const seconds =
    typeof unixSeconds === 'string' ? parseInt(unixSeconds, 10) : unixSeconds
  if (!seconds || Number.isNaN(seconds)) return 0
  const istMs = seconds * 1000 + IST_OFFSET_MIN * 60 * 1000
  return new Date(istMs).getUTCHours()
}


export function parseDateString(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function toDateString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDays(dateStr: string, days: number): string {
  const d = parseDateString(dateStr)
  d.setDate(d.getDate() + days)
  return toDateString(d)
}

/** JS getDay(): 0=Sun..6=Sat. We want Monday=0..Sunday=6 per the brand's week definition. */
function mondayIndex(d: Date): number {
  const day = d.getDay()
  return day === 0 ? 6 : day - 1
}

/** Monday of the week containing dateStr. */
export function mondayOfWeek(dateStr: string): string {
  const d = parseDateString(dateStr)
  const idx = mondayIndex(d)
  d.setDate(d.getDate() - idx)
  return toDateString(d)
}

export function firstOfMonth(dateStr: string): string {
  const d = parseDateString(dateStr)
  return toDateString(new Date(d.getFullYear(), d.getMonth(), 1))
}

export function firstOfYear(dateStr: string): string {
  const d = parseDateString(dateStr)
  return toDateString(new Date(d.getFullYear(), 0, 1))
}

function daysInMonth(year: number, monthIndex0: number): number {
  return new Date(year, monthIndex0 + 1, 0).getDate()
}

/** Same calendar date one month earlier, capped to that month's last valid day. */
export function sameDayPrevMonth(dateStr: string): string {
  const d = parseDateString(dateStr)
  const targetMonth = d.getMonth() - 1
  const year = d.getFullYear() + (targetMonth < 0 ? -1 : 0)
  const month0 = ((targetMonth % 12) + 12) % 12
  const cappedDay = Math.min(d.getDate(), daysInMonth(year, month0))
  return toDateString(new Date(year, month0, cappedDay))
}

export interface PeriodWindow {
  start: string
  end: string
}

export interface ComparisonWindows {
  current: PeriodWindow
  prior: PeriodWindow
}

/** Day-over-Day: today vs yesterday (single-day windows). */
export function dayOverDayWindows(asOf: string): ComparisonWindows {
  const yesterday = addDays(asOf, -1)
  return {
    current: { start: asOf, end: asOf },
    prior: { start: yesterday, end: yesterday },
  }
}

/**
 * Week-to-Date / Week-over-Week.
 * Current: Monday of this week -> asOf.
 * Prior: Monday of last week -> same weekday offset (equal day count), NOT the full prior week.
 */
export function weekOverWeekWindows(asOf: string): ComparisonWindows {
  const thisMonday = mondayOfWeek(asOf)
  const dayOffset = Math.round(
    (parseDateString(asOf).getTime() - parseDateString(thisMonday).getTime()) /
      (1000 * 60 * 60 * 24)
  )
  const lastMonday = addDays(thisMonday, -7)
  const lastWeekSamePoint = addDays(lastMonday, dayOffset)
  return {
    current: { start: thisMonday, end: asOf },
    prior: { start: lastMonday, end: lastWeekSamePoint },
  }
}

/**
 * Month-to-Date / Month-over-Month.
 * Current: 1st of this month -> asOf.
 * Prior: 1st of last month -> same day-number (capped to last valid day of that month).
 */
export function monthOverMonthWindows(asOf: string): ComparisonWindows {
  const thisFirst = firstOfMonth(asOf)
  const priorSamePoint = sameDayPrevMonth(asOf)
  const priorFirst = firstOfMonth(priorSamePoint)
  return {
    current: { start: thisFirst, end: asOf },
    prior: { start: priorFirst, end: priorSamePoint },
  }
}

/** Year-to-Date: Jan 1 -> asOf. No prior-year comparison defined yet (per logic doc). */
export function yearToDateWindow(asOf: string): PeriodWindow {
  return { start: firstOfYear(asOf), end: asOf }
}
/** Format a YYYY-MM-DD date string as "12 June 2026" for display throughout the UI. */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '—'
  const d = parseDateString(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

/** Shorter form, "12 Jun", used where space is tight (chart axis ticks). */
export function formatShortDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = parseDateString(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
export function pctChange(current: number, prior: number): number | null {
  if (prior === 0) return current === 0 ? 0 : null // avoid divide-by-zero; null = "n/a"
  return ((current - prior) / prior) * 100
}

/** Run rate: month-to-date sales projected across the full month, based on days elapsed so far. */
export function runRate(monthToDateSales: number, asOf: string): number {
  const d = parseDateString(asOf)
  const elapsedDays = d.getDate()
  const totalDays = daysInMonth(d.getFullYear(), d.getMonth())
  if (elapsedDays === 0) return 0
  return (monthToDateSales / elapsedDays) * totalDays
}
/** Run Rate = units sold per day over last N days. */
export function runRateUnitsPerDay(
  sales: { date: string; qty: number }[],
  asOf: string,
  windowDays: 7 | 15 | 30
): number {
  const since = addDays(asOf, -windowDays)
  const windowSales = sales.filter((s) => s.date >= since && s.date <= asOf)
  const totalUnits = windowSales.reduce((acc, s) => acc + s.qty, 0)
  return totalUnits / windowDays
}

/** Stock cover in days = current stock ÷ run rate. */
export function stockCoverDays(currentStock: number, runRate: number): number {
  if (runRate === 0) return Infinity
  return currentStock / runRate
}

/** Estimated requirement = run rate × future days. */
export function estimatedRequirement(runRate: number, futureDays: number): number {
  return runRate * futureDays
}

/** Gap = current stock - estimated requirement. Negative = reorder needed. */
export function stockGap(currentStock: number, runRate: number, futureDays: number): number {
  return currentStock - estimatedRequirement(runRate, futureDays)
}

/**
 * Weighted Run Rate = (30d × 17%) + (15d × 33%) + (7d × 50%)
 * More recent windows get higher weight since they better reflect current pace.
 */
export function weightedRunRate(
  sales: { date: string; qty: number }[],
  asOf: string
): number {
  const rr7  = runRateUnitsPerDay(sales, asOf, 7)
  const rr15 = runRateUnitsPerDay(sales, asOf, 15)
  const rr30 = runRateUnitsPerDay(sales, asOf, 30)
  return (rr30 * 0.17) + (rr15 * 0.33) + (rr7 * 0.50)
}

