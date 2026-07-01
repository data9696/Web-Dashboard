import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useData } from '../lib/DataContext'
import { PageLayout } from '../components/PageLayout'
import { ChannelBadge } from '../components/ChannelBadge'
import { weekOverWeekWindows, monthOverMonthWindows, formatDisplayDate } from '../lib/dateLogic'
import { buildMetricSummary, filterSales, groupBy } from '../lib/aggregations'
import { BRAND_COLORS } from '../lib/brand'

const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')

export function ChannelBrand() {
  const { sales, asOfDate } = useData()

  const channels = useMemo(() => {
    const all = Array.from(new Set(sales.map((s) => s.channel))).filter(Boolean)
    return all.sort()
  }, [sales])

  const channelRows = useMemo(
    () =>
      channels.map((ch) => {
        const wow = buildMetricSummary(sales, weekOverWeekWindows(asOfDate), { channel: ch })
        const mom = buildMetricSummary(sales, monthOverMonthWindows(asOfDate), { channel: ch })
        return { channel: ch, wow, mom }
      }),
    [channels, sales, asOfDate]
  )

  const brandMonthly = useMemo(
    () => groupBy(filterSales(sales, monthOverMonthWindows(asOfDate).current), (s) => s.brand),
    [sales, asOfDate]
  )

  const channelByBrand = useMemo(() => {
    const monthSales = filterSales(sales, monthOverMonthWindows(asOfDate).current)
    const map = new Map<
      string,
      { channel: string; 'Cocoon Care': number; 'The Boo Boo Club': number; Other: number }
    >()
    for (const s of monthSales) {
      if (!map.has(s.channel)) {
        map.set(s.channel, { channel: s.channel, 'Cocoon Care': 0, 'The Boo Boo Club': 0, Other: 0 })
      }
      const row = map.get(s.channel)!
      ;(row as any)[s.brand] += s.invoiceAmount
    }
    return Array.from(map.values())
  }, [sales, asOfDate])

  return (
    <PageLayout title="Channel & Brand Sales" subtitle={`As of ${formatDisplayDate(asOfDate)}`}>
      <div className="card p-5 mb-8">
        <h3 className="font-display text-lg mb-4">Sales by Channel, split by Brand — This Month</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={channelByBrand}>
            <CartesianGrid stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="channel" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => inr(Number(v))} />
            <Legend />
            <Bar dataKey="Cocoon Care" stackId="a" fill={BRAND_COLORS['Cocoon Care']} />
            <Bar dataKey="The Boo Boo Club" stackId="a" fill={BRAND_COLORS['The Boo Boo Club']} />
            <Bar dataKey="Other" stackId="a" fill={BRAND_COLORS['Other']} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card p-5 mb-8 overflow-x-auto">
        <h3 className="font-display text-lg mb-4">Channel Performance — WoW &amp; MoM</h3>
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="text-left text-[var(--color-muted)] text-xs uppercase">
              <th className="pb-2">Channel</th>
              <th className="pb-2 text-right">WTD Sales</th>
              <th className="pb-2 text-right">WoW %</th>
              <th className="pb-2 text-right">MTD Sales</th>
              <th className="pb-2 text-right">MoM %</th>
            </tr>
          </thead>
          <tbody>
            {channelRows
              .sort((a, b) => b.mom.current - a.mom.current)
              .map((r) => (
                <tr key={r.channel} className="border-t border-[var(--color-border)]">
                  <td className="py-2 flex items-center gap-2">
                    <ChannelBadge channel={r.channel} />
                    {r.channel}
                  </td>
                  <td className="py-2 text-right">{inr(r.wow.current)}</td>
                  <td
                    className={`py-2 text-right ${
                      (r.wow.changePct ?? 0) >= 0 ? 'text-[var(--color-sage-dark)]' : 'text-[#b4564f]'
                    }`}
                  >
                    {r.wow.changePct === null ? 'n/a' : `${r.wow.changePct.toFixed(1)}%`}
                  </td>
                  <td className="py-2 text-right">{inr(r.mom.current)}</td>
                  <td
                    className={`py-2 text-right ${
                      (r.mom.changePct ?? 0) >= 0 ? 'text-[var(--color-sage-dark)]' : 'text-[#b4564f]'
                    }`}
                  >
                    {r.mom.changePct === null ? 'n/a' : `${r.mom.changePct.toFixed(1)}%`}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="card p-5">
        <h3 className="font-display text-lg mb-4">Brand Ranking — This Month</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--color-muted)] text-xs uppercase">
              <th className="pb-2">Brand</th>
              <th className="pb-2 text-right">Sales</th>
              <th className="pb-2 text-right">Units</th>
            </tr>
          </thead>
          <tbody>
            {brandMonthly.map((b) => (
              <tr key={b.key} className="border-t border-[var(--color-border)]">
                <td className="py-2 flex items-center gap-2">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{ background: BRAND_COLORS[b.key as keyof typeof BRAND_COLORS] || '#999' }}
                  />
                  {b.key}
                </td>
                <td className="py-2 text-right">{inr(b.sales)}</td>
                <td className="py-2 text-right">{b.units}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageLayout>
  )
}
