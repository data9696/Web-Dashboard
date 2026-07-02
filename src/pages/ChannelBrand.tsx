import { useMemo, useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useData } from '../lib/DataContext'
import { PageLayout } from '../components/PageLayout'
import { ChannelBadge } from '../components/ChannelBadge'
import { BrandDonut } from '../components/BrandDonut'
import { SortableTable } from '../components/SortableTable'
import { QuickInsights } from '../components/QuickInsights'
import { Reveal } from '../components/Reveal'
import { DateRangePicker, defaultDateRange } from '../components/DateRangePicker'
import type { DateRange } from '../components/DateRangePicker'
import {
  weekOverWeekWindows,
  monthOverMonthWindows,
  formatDisplayDate,
  formatShortDate,
  addDays,
  firstOfMonth,
} from '../lib/dateLogic'
import {
  buildMetricSummary,
  filterSales,
  groupBy,
  groupByDate,
} from '../lib/aggregations'
import { BRAND_COLORS } from '../lib/brand'

const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')

const CHANNEL_LINE_COLORS = [
  '#16a34a', '#2454a8', '#6d28d9', '#d97706',
  '#dc2626', '#0891b2', '#be185d', '#065f46',
]

const ALL_BRANDS = ['All', 'Cocoon Care', 'The Boo Boo Club']

export function ChannelBrand() {
  const { sales, asOfDate } = useData()

  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [brandFilter, setBrandFilter] = useState<string>('All')
  const [channelFilter, setChannelFilter] = useState<string>('All')

  useEffect(() => {
    if (asOfDate && !dateRange) {
      setDateRange(defaultDateRange(asOfDate))
    }
  }, [asOfDate, dateRange])

  const effectiveRange: DateRange = dateRange ?? {
    start: asOfDate ? firstOfMonth(asOfDate) : '',
    end: asOfDate ?? '',
    label: 'This Month',
  }

  // All unique channels for filter
  const allChannels = useMemo(() => {
    const channels = Array.from(new Set(sales.map((s) => s.channel))).filter(Boolean).sort()
    return ['All', ...channels]
  }, [sales])

  // WoW & MoM rows
  const channels = useMemo(() => allChannels.filter((c) => c !== 'All'), [allChannels])

  const channelRows = useMemo(
    () =>
      channels.map((ch) => {
        const wow = buildMetricSummary(sales, weekOverWeekWindows(asOfDate), { channel: ch })
        const mom = buildMetricSummary(sales, monthOverMonthWindows(asOfDate), { channel: ch })
        return { channel: ch, wow, mom }
      }),
    [channels, sales, asOfDate]
  )

  // Range-based sales with filters applied
  const rangeSales = useMemo(() => {
    let filtered = effectiveRange.start && effectiveRange.end
      ? filterSales(sales, { start: effectiveRange.start, end: effectiveRange.end })
      : []
    if (brandFilter !== 'All') filtered = filtered.filter((s) => s.brand === brandFilter)
    if (channelFilter !== 'All') filtered = filtered.filter((s) => s.channel === channelFilter)
    return filtered
  }, [sales, effectiveRange, brandFilter, channelFilter])

  const byChannel = useMemo(() => groupBy(rangeSales, (s) => s.channel), [rangeSales])
  const byBrand = useMemo(() => groupBy(rangeSales, (s) => s.brand), [rangeSales])

  const top5Channels = useMemo(() => byChannel.slice(0, 5).map((c) => c.key), [byChannel])

  const multiLineTrend = useMemo(() => {
    const rangeData = filterSales(sales, {
      start: effectiveRange.start || addDays(asOfDate, -30),
      end: effectiveRange.end || asOfDate,
    })
    const byDate = groupByDate(rangeData)
    return byDate.map((g) => {
      const row: Record<string, string | number> = { date: g.key }
      for (const ch of top5Channels) {
        const dayCh = rangeData.filter((s) => s.date === g.key && s.channel === ch)
        row[ch] = dayCh.reduce((a, s) => a + s.invoiceAmount, 0)
      }
      return row
    })
  }, [sales, effectiveRange, top5Channels, asOfDate])

  const topChannel = byChannel[0]
  const worstChannel = byChannel[byChannel.length - 1]
  const totalSales = byChannel.reduce((a, c) => a + c.sales, 0)

  return (
    <PageLayout
      title="Channel & Brand Sales"
      subtitle={`As of ${formatDisplayDate(asOfDate)}`}
    >
      {/* Filters row */}
      <Reveal>
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Brand filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-muted)] uppercase tracking-wide">Brand</span>
            <div className="flex gap-1">
              {ALL_BRANDS.map((b) => (
                <button
                  key={b}
                  onClick={() => setBrandFilter(b)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    brandFilter === b
                      ? 'bg-[var(--color-sage)] text-white shadow-sm'
                      : 'bg-white border border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-sage)]'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="w-px h-5 bg-[var(--color-border)]" />

          {/* Channel filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[var(--color-muted)] uppercase tracking-wide">Channel</span>
            <div className="flex flex-wrap gap-1">
              {allChannels.map((ch) => (
                <button
                  key={ch}
                  onClick={() => setChannelFilter(ch)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    channelFilter === ch
                      ? 'bg-[var(--color-smokeblue)] text-white shadow-sm'
                      : 'bg-white border border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-smokeblue)]'
                  }`}
                >
                  {ch === 'All' ? 'All' : <span className="flex items-center gap-1"><ChannelBadge channel={ch} size={14} />{ch.replace(/^[AF] - /, '')}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* Trend chart with date range */}
      <Reveal delay={60}>
        <div className="card p-5 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <h3 className="font-display text-lg">Channel Performance Trend</h3>
            <span className="text-xs text-[var(--color-muted)]">{effectiveRange.label}</span>
          </div>
          <DateRangePicker asOf={asOfDate} onChange={setDateRange} />
          {multiLineTrend.length > 1 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={multiLineTrend}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  minTickGap={30}
                  tickFormatter={(d) => formatShortDate(d)}
                />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => inr(Number(v))} />
                <Legend />
                {top5Channels.map((ch, i) => (
                  <Line
                    key={ch}
                    type="monotone"
                    dataKey={ch}
                    stroke={CHANNEL_LINE_COLORS[i % CHANNEL_LINE_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-[var(--color-muted)] text-sm">
              No data for this period
            </div>
          )}
        </div>
      </Reveal>

      {/* Top / Lowest / Top Brand */}
      {topChannel && (
        <Reveal delay={100}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card p-5 border-l-4 border-[var(--color-sage)]">
              <div className="text-xs uppercase tracking-wide text-[var(--color-muted)] mb-2">🏆 Top Channel</div>
              <div className="flex items-center gap-2 mb-1">
                <ChannelBadge channel={topChannel.key} size={20} />
                <div className="font-display text-xl text-[var(--color-charcoal)]">{topChannel.key}</div>
              </div>
              <div className="text-2xl font-bold text-[var(--color-sage-dark)]">{inr(topChannel.sales)}</div>
              <div className="text-sm text-[var(--color-muted)] mt-1">
                {totalSales > 0 ? ((topChannel.sales / totalSales) * 100).toFixed(0) : 0}% of total · {topChannel.units} units
              </div>
            </div>

            {worstChannel && worstChannel.key !== topChannel.key && (
              <div className="card p-5 border-l-4 border-[#dc2626]">
                <div className="text-xs uppercase tracking-wide text-[var(--color-muted)] mb-2">⚠️ Lowest Channel</div>
                <div className="flex items-center gap-2 mb-1">
                  <ChannelBadge channel={worstChannel.key} size={20} />
                  <div className="font-display text-xl text-[var(--color-charcoal)]">{worstChannel.key}</div>
                </div>
                <div className="text-2xl font-bold text-[#dc2626]">{inr(worstChannel.sales)}</div>
                <div className="text-sm text-[var(--color-muted)] mt-1">
                  {totalSales > 0 ? ((worstChannel.sales / totalSales) * 100).toFixed(0) : 0}% of total · {worstChannel.units} units
                </div>
              </div>
            )}

            {byBrand[0] && (() => {
              const topBrand = byBrand[0]
              const brandTotal = byBrand.reduce((a, b) => a + b.sales, 0)
              const pct = brandTotal > 0 ? ((topBrand.sales / brandTotal) * 100).toFixed(0) : '0'
              return (
                <div className="card p-5 border-l-4 border-[var(--color-corn)]">
                  <div className="text-xs uppercase tracking-wide text-[var(--color-muted)] mb-2">🏅 Top Brand</div>
                  <div className="font-display text-xl text-[var(--color-charcoal)] mb-1">{topBrand.key}</div>
                  <div className="text-2xl font-bold text-[#92400e]">{inr(topBrand.sales)}</div>
                  <div className="text-sm text-[var(--color-muted)] mt-1">{pct}% of total · {topBrand.units} units</div>
                </div>
              )
            })()}
          </div>
        </Reveal>
      )}

      {/* Channel Mix + Brand Split */}
      <Reveal delay={140}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <SortableTable
            title={`Channel Mix — ${effectiveRange.label}`}
            rows={byChannel.map((c) => ({
              name: <span className="flex items-center gap-2"><ChannelBadge channel={c.key} />{c.key}</span>,
              namePlain: c.key,
              sales: c.sales,
              units: c.units,
            }))}
          />

          <div className="card p-5">
            <h3 className="font-display text-lg mb-4">Brand Split — {effectiveRange.label}</h3>
            <BrandDonut data={byBrand} colors={BRAND_COLORS} />
            <table className="w-full text-sm mt-4">
              <thead>
                <tr className="text-left text-[var(--color-muted)] text-xs uppercase border-b border-[var(--color-border)]">
                  <th className="pb-2">Brand</th>
                  <th className="pb-2 text-right">Sales</th>
                  <th className="pb-2 text-right">Units</th>
                  <th className="pb-2 text-right">Share</th>
                </tr>
              </thead>
              <tbody>
                {byBrand.map((b) => {
                  const brandTotal = byBrand.reduce((a, x) => a + x.sales, 0)
                  const pct = brandTotal > 0 ? ((b.sales / brandTotal) * 100).toFixed(0) : '0'
                  return (
                    <tr key={b.key} className="border-t border-[var(--color-border)] hover:bg-[var(--color-cream)]">
                      <td className="py-2 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: BRAND_COLORS[b.key as keyof typeof BRAND_COLORS] || '#999' }} />
                        {b.key}
                      </td>
                      <td className="py-2 text-right font-medium">{inr(b.sales)}</td>
                      <td className="py-2 text-right">{b.units}</td>
                      <td className="py-2 text-right text-[var(--color-sage-dark)] font-medium">{pct}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>

      {/* WoW & MoM table */}
      <Reveal delay={180}>
        <div className="card p-5 mb-8 overflow-x-auto">
          <h3 className="font-display text-lg mb-4">Channel Performance — WoW &amp; MoM</h3>
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="text-left text-[var(--color-muted)] text-xs uppercase border-b border-[var(--color-border)]">
                <th className="pb-2">Channel</th>
                <th className="pb-2 text-right">WTD Sales</th>
                <th className="pb-2 text-right">WoW %</th>
                <th className="pb-2 text-right">MTM Sales</th>
                <th className="pb-2 text-right">MoM %</th>
              </tr>
            </thead>
            <tbody>
              {channelRows
                .filter((r) => channelFilter === 'All' || r.channel === channelFilter)
                .sort((a, b) => b.mom.current - a.mom.current)
                .map((r) => (
                  <tr key={r.channel} className="border-t border-[var(--color-border)] hover:bg-[var(--color-cream)]">
                    <td className="py-2 flex items-center gap-2">
                      <ChannelBadge channel={r.channel} />
                      {r.channel}
                    </td>
                    <td className="py-2 text-right">{inr(r.wow.current)}</td>
                    <td className={`py-2 text-right font-medium ${(r.wow.changePct ?? 0) >= 0 ? 'text-[var(--color-sage-dark)]' : 'text-[#dc2626]'}`}>
                      {r.wow.changePct === null ? '—' : `${r.wow.changePct >= 0 ? '+' : ''}${r.wow.changePct.toFixed(1)}%`}
                    </td>
                    <td className="py-2 text-right">{inr(r.mom.current)}</td>
                    <td className={`py-2 text-right font-medium ${(r.mom.changePct ?? 0) >= 0 ? 'text-[var(--color-sage-dark)]' : 'text-[#dc2626]'}`}>
                      {r.mom.changePct === null ? '—' : `${r.mom.changePct >= 0 ? '+' : ''}${r.mom.changePct.toFixed(1)}%`}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Reveal>

      {/* Quick Insights */}
      <Reveal delay={220}>
        <div className="mb-8">
          <QuickInsights sales={rangeSales} label={effectiveRange.label} />
        </div>
      </Reveal>
    </PageLayout>
  )
}
