import { useState } from 'react'
import type { NormalizedSale } from '../types'

const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')
const BRANDS = ['All', 'Cocoon Care', 'The Boo Boo Club']

interface Props {
  sales: NormalizedSale[]
  label: string
  onBrandChange?: (brand: string) => void
}

export function SalesSummaryCard({ sales, label, onBrandChange }: Props) {
  const [brand, setBrand] = useState('All')

  const filtered = brand === 'All' ? sales : sales.filter((s) => s.brand === brand)
  const total = filtered.reduce((a, s) => a + s.invoiceAmount, 0)
  const units = filtered.reduce((a, s) => a + s.qty, 0)
  const orders = new Set(filtered.map((s) => s.channelOrderId).filter(Boolean)).size

  function handleBrand(b: string) {
    setBrand(b)
    onBrandChange?.(b)
  }

  return (
    <div className="card p-5 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-[var(--color-muted)] mb-1">Total Sales — {label}</div>
          <div className="font-display text-3xl text-[var(--color-charcoal)]">{inr(total)}</div>
          <div className="text-sm text-[var(--color-muted)] mt-1">
            {units.toLocaleString('en-IN')} units · {orders.toLocaleString('en-IN')} orders
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-[var(--color-muted)] mb-2">Filter by Brand</div>
          <div className="flex gap-1.5">
            {BRANDS.map((b) => (
              <button
                key={b}
                onClick={() => handleBrand(b)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  brand === b
                    ? 'bg-[var(--color-sage)] text-white shadow-sm scale-105'
                    : 'bg-white border border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-sage)]'
                }`}
              >
                {b === 'All' ? '🏷️ All' : b === 'Cocoon Care' ? '🌿 Cocoon' : '🐻 Boo Boo'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
