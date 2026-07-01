import type { LucideIcon } from 'lucide-react'
import { MiniTrend } from './MiniTrend'

interface MetricCardProps {
  label: string
  value: string
  changePct?: number | null
  changeAmount?: number
  changeLabel?: string
  accent?: 'sage' | 'pink' | 'blue' | 'corn'
  icon?: LucideIcon
  sparkline?: number[]
}

const ACCENT_MAP: Record<string, { text: string; bg: string }> = {
  sage: { text: 'var(--color-sage-dark)', bg: 'var(--color-sage-light)' },
  pink: { text: '#b3265f', bg: 'var(--color-dustypink-light)' },
  blue: { text: '#2454a8', bg: 'var(--color-smokeblue-light)' },
  corn: { text: '#8a6a1f', bg: 'var(--color-corn-light)' },
}

export function MetricCard({
  label,
  value,
  changePct,
  changeAmount,
  changeLabel,
  accent = 'sage',
  icon: Icon,
  sparkline,
}: MetricCardProps) {
  const isUp = (changePct ?? 0) >= 0
  const hasChange = changePct !== undefined && changePct !== null
  const colors = ACCENT_MAP[accent]

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-3">
        {Icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: colors.bg, color: colors.text }}
          >
            <Icon size={16} strokeWidth={2.25} />
          </div>
        )}
        <div className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
          {label}
        </div>
      </div>
      <div className="font-display text-2xl text-[var(--color-charcoal)]">{value}</div>
      {hasChange && (
        <div
          className={`text-xs mt-2 inline-flex items-center gap-1 ${
            isUp ? 'text-[var(--color-sage-dark)]' : 'text-[#b4564f]'
          }`}
        >
          <span>{isUp ? '▲' : '▼'}</span>
          <span>{Math.abs(changePct!).toFixed(1)}%</span>
          {changeAmount !== undefined && (
            <span className="text-[var(--color-muted)]">
              ({changeAmount >= 0 ? '+' : ''}
              {Math.round(changeAmount).toLocaleString('en-IN')})
            </span>
          )}
          {changeLabel && <span className="text-[var(--color-muted)]">{changeLabel}</span>}
        </div>
      )}
      {changePct === null && (
        <div className="text-xs mt-2 text-[var(--color-muted)]">n/a (no prior data)</div>
      )}
      {sparkline && sparkline.length > 1 && (
        <div className="mt-2 -mx-1">
          <MiniTrend values={sparkline} />
        </div>
      )}
    </div>
  )
}