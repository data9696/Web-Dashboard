import type { LucideIcon } from 'lucide-react'
import { MiniTrend } from './MiniTrend'
import { useCountUp } from '../hooks/useCountUp'

interface MetricCardProps {
  label: string
  value: string
  rawValue?: number
  changePct?: number | null
  changeAmount?: number
  changeLabel?: string
  accent?: 'sage' | 'pink' | 'blue' | 'corn' | 'purple' | 'emerald' | 'orange'
  icon?: LucideIcon
  sparkline?: number[]
  dateLabel?: string
}

const ACCENT_MAP: Record<string, { text: string; bg: string }> = {
  sage:    { text: '#166534', bg: '#dcfce7' },
  pink:    { text: '#b3265f', bg: '#fce7f3' },
  blue:    { text: '#1e40af', bg: '#dbeafe' },
  corn:    { text: '#92400e', bg: '#fef3c7' },
  purple:  { text: '#6d28d9', bg: '#ede9fe' },
  emerald: { text: '#065f46', bg: '#d1fae5' },
  orange:  { text: '#c2410c', bg: '#ffedd5' },
}

function AnimatedNumber({ rawValue, displayValue }: { rawValue: number; displayValue: string }) {
  const animated = useCountUp(rawValue)
  const isRupee = displayValue.startsWith('₹')
  const hasSuffix = displayValue.includes(' ') && !isRupee
  const suffix = hasSuffix ? ' ' + displayValue.split(' ').slice(1).join(' ') : ''
  if (isRupee) return <span>₹{Math.round(animated).toLocaleString('en-IN')}</span>
  if (suffix) return <span>{Number(animated).toFixed(1)}{suffix}</span>
  return <span>{Math.round(animated).toLocaleString('en-IN')}</span>
}

export function MetricCard({
  label,
  value,
  rawValue,
  changePct,
  changeAmount,
  changeLabel,
  accent = 'sage',
  icon: Icon,
  sparkline,
  dateLabel,
}: MetricCardProps) {
  const isUp = (changePct ?? 0) >= 0
  const hasChange = changePct !== undefined && changePct !== null
  const colors = ACCENT_MAP[accent]

  return (
    <div className="card p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {Icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: colors.bg, color: colors.text }}
          >
            <Icon size={15} strokeWidth={2.25} />
          </div>
        )}
        <div className="text-xs uppercase tracking-wide text-[var(--color-muted)] font-medium">
          {label}
        </div>
      </div>

      <div className="font-display text-xl text-[var(--color-charcoal)] leading-tight">
        {rawValue !== undefined
          ? <AnimatedNumber rawValue={rawValue} displayValue={value} />
          : <span>{value}</span>
        }
      </div>

      {dateLabel && (
        <div className="text-[10px] text-[var(--color-muted)] opacity-60 -mt-1">
          {dateLabel}
        </div>
      )}

      {hasChange && (
        <div className="flex items-center gap-1.5">
          <span
            className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: isUp ? '#dcfce7' : '#fee2e2',
              color: isUp ? '#166534' : '#991b1b',
            }}
          >
            {isUp ? '▲' : '▼'} {Math.abs(changePct!).toFixed(1)}%
          </span>
          {changeLabel && (
            <span className="text-xs text-[var(--color-muted)]">{changeLabel}</span>
          )}
          {changeAmount !== undefined && !changeLabel && (
            <span className="text-xs text-[var(--color-muted)]">
              {changeAmount >= 0 ? '+' : ''}
              {Math.round(changeAmount).toLocaleString('en-IN')}
            </span>
          )}
        </div>
      )}

      {changePct === null && (
        <div className="text-xs text-[var(--color-muted)]">No prior data</div>
      )}

      {sparkline && sparkline.length > 1 && (
        <div className="mt-1 -mx-1">
          <MiniTrend values={sparkline} height={36} />
        </div>
      )}
    </div>
  )
}