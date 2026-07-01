import { useMemo } from 'react'
import { useData } from '../lib/DataContext'
import { PageLayout } from '../components/PageLayout'
import { monthOverMonthWindows, formatDisplayDate } from '../lib/dateLogic'
import { filterSales, groupBy } from '../lib/aggregations'

const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')

export function ProductAnalysis() {
  const { sales, stock, asOfDate } = useData()

  const monthSales = useMemo(
    () => filterSales(sales, monthOverMonthWindows(asOfDate).current),
    [sales, asOfDate]
  )

  const bestSellers = useMemo(
    () => groupBy(monthSales, (s) => s.listingSku || s.skuCode || 'Unknown').slice(0, 10),
    [monthSales]
  )

  const worstSellers = useMemo(() => {
    const grouped = groupBy(monthSales, (s) => s.listingSku || s.skuCode || 'Unknown')
    return grouped.slice(-10).reverse()
  }, [monthSales])

  const latestStockDate = useMemo(() => {
    let latest = ''
    for (const s of stock) {
      if (s.snapshot_date && s.snapshot_date > latest) latest = s.snapshot_date
    }
    return latest
  }, [stock])

  const latestStock = useMemo(
    () => stock.filter((s) => s.snapshot_date === latestStockDate),
    [stock, latestStockDate]
  )

  const lowStock = useMemo(
    () =>
      [...latestStock]
        .map((s) => ({ ...s, inStockNum: Number(s.in_stock) || 0 }))
        .filter((s) => s.inStockNum > 0)
        .sort((a, b) => a.inStockNum - b.inStockNum)
        .slice(0, 15),
    [latestStock]
  )

  return (
    <PageLayout title="Product & Stock Analysis" subtitle={`As of ${formatDisplayDate(asOfDate)} · stock snapshot: ${formatDisplayDate(latestStockDate)}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card p-5">
          <h3 className="font-display text-lg mb-4">Best Sellers — This Month</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--color-muted)] text-xs uppercase">
                <th className="pb-2">SKU</th>
                <th className="pb-2 text-right">Sales</th>
                <th className="pb-2 text-right">Units</th>
              </tr>
            </thead>
            <tbody>
              {bestSellers.map((s) => (
                <tr key={s.key} className="border-t border-[var(--color-border)]">
                  <td className="py-2">{s.key}</td>
                  <td className="py-2 text-right">{inr(s.sales)}</td>
                  <td className="py-2 text-right">{s.units}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card p-5">
          <h3 className="font-display text-lg mb-4">Worst Sellers — This Month</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--color-muted)] text-xs uppercase">
                <th className="pb-2">SKU</th>
                <th className="pb-2 text-right">Sales</th>
                <th className="pb-2 text-right">Units</th>
              </tr>
            </thead>
            <tbody>
              {worstSellers.map((s) => (
                <tr key={s.key} className="border-t border-[var(--color-border)]">
                  <td className="py-2">{s.key}</td>
                  <td className="py-2 text-right">{inr(s.sales)}</td>
                  <td className="py-2 text-right">{s.units}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-display text-lg mb-4">Low Stock Watch (latest snapshot)</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--color-muted)] text-xs uppercase">
              <th className="pb-2">SKU</th>
              <th className="pb-2">Name</th>
              <th className="pb-2">Warehouse</th>
              <th className="pb-2 text-right">In Stock</th>
            </tr>
          </thead>
          <tbody>
            {lowStock.map((s) => (
              <tr key={s.id} className="border-t border-[var(--color-border)]">
                <td className="py-2">{s.sku_code}</td>
                <td className="py-2">{s.name}</td>
                <td className="py-2">{s.warehouse_id}</td>
                <td className="py-2 text-right text-[#b4564f] font-medium">{s.inStockNum}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageLayout>
  )
}
