interface ShareBarProps {
  label: string
  pct: number
  color: string
}

export function ShareBar({ label, pct, color }: ShareBarProps) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="text-[var(--color-muted)]">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-[var(--color-border)] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(pct, 100)}%`, background: color }}
        />
      </div>
    </div>
  )
}