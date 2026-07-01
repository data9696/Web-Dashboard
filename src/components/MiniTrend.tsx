import { ComposedChart, Line, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts'

const UP_COLOR = '#16a34a'
const DOWN_COLOR = '#dc2626'

export function MiniTrend({ values, height = 36 }: { values: number[]; height?: number }) {
  if (values.length < 2) return null

  const indexed = values.map((v, i) => ({ idx: i, v }))
  const segments: { data: typeof indexed; color: string }[] = []
  for (let i = 1; i < indexed.length; i++) {
    const prev = indexed[i - 1]
    const cur = indexed[i]
    segments.push({
      data: [prev, cur],
      color: cur.v >= prev.v ? UP_COLOR : DOWN_COLOR,
    })
  }

  const gradientId = `sparkGradient-${Math.round(Math.random() * 1e6)}`

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={indexed} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={UP_COLOR} stopOpacity={0.25} />
            <stop offset="100%" stopColor={UP_COLOR} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="idx" type="number" domain={[0, indexed.length - 1]} hide />
        <YAxis type="number" domain={['auto', 'auto']} hide />
        <Area
          type="monotone"
          dataKey="v"
          stroke="none"
          fill={`url(#${gradientId})`}
          isAnimationActive={false}
        />
        {segments.map((seg, i) => (
          <Line
            key={i}
            data={seg.data}
            dataKey="v"
            stroke={seg.color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  )
}