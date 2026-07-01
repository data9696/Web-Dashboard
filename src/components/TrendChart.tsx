import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatShortDate, formatDisplayDate } from '../lib/dateLogic'

interface TrendPoint {
  date: string
  sales: number
}

const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')

const UP_COLOR = '#16a34a'
const DOWN_COLOR = '#dc2626'

export function TrendChart({ trend, height = 220 }: { trend: TrendPoint[]; height?: number }) {
  if (!trend || trend.length < 2) {
    return (
      <div
        className="flex items-center justify-center text-[var(--color-muted)] text-sm"
        style={{ height }}
      >
        No data for this period
      </div>
    )
  }

  const indexed = trend.map((t, i) => ({ idx: i, date: t.date, sales: t.sales }))

  const segments: { data: typeof indexed; color: string }[] = []
  for (let i = 1; i < indexed.length; i++) {
    const prev = indexed[i - 1]
    const cur = indexed[i]
    segments.push({
      data: [prev, cur],
      color: cur.sales >= prev.sales ? UP_COLOR : DOWN_COLOR,
    })
  }

  const gradientId = `trendGradient-${trend.length}`

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={indexed}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={UP_COLOR} stopOpacity={0.15} />
            <stop offset="100%" stopColor={UP_COLOR} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="idx"
          type="number"
          domain={[0, Math.max(indexed.length - 1, 1)]}
          allowDecimals={false}
          tick={{ fontSize: 11 }}
          tickFormatter={(idx) => (indexed[idx] ? formatShortDate(indexed[idx].date) : '')}
          minTickGap={30}
        />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          formatter={(v) => inr(Number(v))}
          labelFormatter={(idx) => (indexed[idx] ? formatDisplayDate(indexed[idx].date) : '')}
        />
        <Area
          type="monotone"
          dataKey="sales"
          stroke="none"
          fill={`url(#${gradientId})`}
          isAnimationActive={false}
        />
        {segments.map((seg, i) => (
          <Line
            key={i}
            data={seg.data}
            dataKey="sales"
            stroke={seg.color}
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
            legendType="none"
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  )
}