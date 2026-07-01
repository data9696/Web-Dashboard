import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface HourPoint {
  date: string
  sales: number
}

const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')

const UP_COLOR = '#16a34a'
const DOWN_COLOR = '#dc2626'
const ZERO_COLOR = '#e5e7eb'

export function HourlyChart({ trend, height = 280 }: { trend: HourPoint[]; height?: number }) {
  if (!trend || trend.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={trend} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <CartesianGrid stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} minTickGap={20} interval={2} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(v) => [inr(Number(v)), 'Sales']} labelFormatter={(label) => `Hour: ${label}`} />
        <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
          {trend.map((entry, i) => {
            const prev = trend[i - 1]
            let color = ZERO_COLOR
            if (entry.sales > 0) {
              color = prev && prev.sales > 0
                ? entry.sales >= prev.sales ? UP_COLOR : DOWN_COLOR
                : UP_COLOR
            }
            return <Cell key={`cell-${i}`} fill={color} />
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}