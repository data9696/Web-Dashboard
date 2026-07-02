import { useMemo } from 'react'
import type { NormalizedSale } from '../types'
import { addDays, toDateString, formatDisplayDate } from '../lib/dateLogic'

interface Props {
  sales: NormalizedSale[]
  asOf: string
  weeks?: number
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getMonday(dateStr: string): string {
  const d = new Date(dateStr)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return toDateString(d)
}

function getColor(value: number, max: number): string {
  if (value === 0) return 'var(--color-border)'
  const intensity = Math.min(value / max, 1)
  if (intensity < 0.25) return '#bbf7d0'
  if (intensity < 0.5)  return '#4ade80'
  if (intensity < 0.75) return '#16a34a'
  return '#14532d'
}

const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')

export function CalendarHeatmap({ sales, asOf, weeks = 12 }: Props) {
  const { grid, monthLabels, maxSales } = useMemo(() => {
    // Build a map of date → total sales
    const salesByDate = new Map<string, number>()
    for (const s of sales) {
      salesByDate.set(s.date, (salesByDate.get(s.date) ?? 0) + s.invoiceAmount)
    }

    // Start from Monday of (weeks) weeks ago
    const endMonday = getMonday(asOf)
    const startMonday = addDays(endMonday, -(weeks - 1) * 7)

    // Build grid: array of weeks, each week = 7 days
    const grid: { date: string; sales: number }[][] = []
    const monthLabels: { label: string; colIndex: number }[] = []
    let seenMonths = new Set<string>()

    for (let w = 0; w < weeks; w++) {
      const week: { date: string; sales: number }[] = []
      for (let d = 0; d < 7; d++) {
        const date = addDays(startMonday, w * 7 + d)
        const daySales = salesByDate.get(date) ?? 0
        week.push({ date, sales: daySales })

        // Track month labels
        const month = date.slice(0, 7) // YYYY-MM
        if (!seenMonths.has(month) && d === 0) {
          seenMonths.add(month)
          const label = new Date(date).toLocaleDateString('en-GB', { month: 'short' })
          monthLabels.push({ label, colIndex: w })
        }
      }
      grid.push(week)
    }

    const maxSales = Math.max(...[...salesByDate.values()], 1)
    return { grid, monthLabels, maxSales }
  }, [sales, asOf, weeks])

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg">Sales Heatmap — Last {weeks} Weeks</h3>
        <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
          <span>Low</span>
          {['#bbf7d0', '#4ade80', '#16a34a', '#14532d'].map((c) => (
            <span key={c} className="w-3 h-3 rounded-sm inline-block" style={{ background: c }} />
          ))}
          <span>High</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex mb-1 ml-8">
            {monthLabels.map((m, i) => (
              <div
                key={i}
                className="text-xs text-[var(--color-muted)]"
                style={{ marginLeft: i === 0 ? m.colIndex * 18 : (m.colIndex - (monthLabels[i-1]?.colIndex ?? 0)) * 18 - 20 }}
              >
                {m.label}
              </div>
            ))}
          </div>

          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-1 mr-1">
              {DAYS.map((d) => (
                <div key={d} className="text-[10px] text-[var(--color-muted)] h-[14px] flex items-center">
                  {d}
                </div>
              ))}
            </div>

            {/* Grid */}
            {grid.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day, di) => (
                  <div
                    key={di}
                    title={`${formatDisplayDate(day.date)}: ${inr(day.sales)}`}
                    className="w-[14px] h-[14px] rounded-sm cursor-pointer transition-transform hover:scale-125"
                    style={{ background: getColor(day.sales, maxSales) }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}