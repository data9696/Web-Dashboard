import { PieChart, Pie, Cell, Tooltip } from 'recharts'

interface BrandSlice {
  key: string
  sales: number
}

const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')

export function BrandDonut({
  data,
  colors,
}: {
  data: BrandSlice[]
  colors: Record<string, string>
}) {
  const total = data.reduce((acc, d) => acc + d.sales, 0)

  return (
    <div className="flex items-center gap-6">
      <PieChart width={140} height={140}>
        <Pie
          data={data}
          dataKey="sales"
          nameKey="key"
          innerRadius={40}
          outerRadius={64}
          paddingAngle={2}
        >
          {data.map((d) => (
            <Cell key={d.key} fill={colors[d.key] || '#999'} stroke="none" />
          ))}
        </Pie>
        <Tooltip formatter={(v) => inr(Number(v))} />
      </PieChart>

      <div className="space-y-2 text-sm">
        {data.map((d) => (
          <div key={d.key} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: colors[d.key] || '#999' }}
            />
            <span className="flex-1">{d.key}</span>
            <span className="font-medium">
              {total > 0 ? ((d.sales / total) * 100).toFixed(0) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}