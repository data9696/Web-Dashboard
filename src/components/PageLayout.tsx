import type { ReactNode } from 'react'
import { useData } from '../lib/DataContext'
import { AsOfDatePicker } from './AsOfDatePicker'
import { ThemeToggle } from './ThemeToggle'
import { formatDisplayDate } from '../lib/dateLogic'

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

export function PageLayout({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  const { loading, error, sales, trueLatestDate } = useData()
  const userName = localStorage.getItem('dashboard_user_name') || 'Team'

  return (
    <div className="flex-1 px-8 py-6 max-w-[1400px]">
      {/* Top bar */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <div className="text-sm text-[var(--color-muted)] mb-1">
            👋 {getGreeting()}, {userName}
          </div>
          <h1 className="font-display text-2xl text-[var(--color-charcoal)]">{title}</h1>
          {subtitle && (
            <p className="text-sm text-[var(--color-muted)] mt-1">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Status badges */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[var(--color-sage-light)] text-[var(--color-sage-dark)] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-sage)] animate-pulse inline-block" />
              Live · Auto Sync
            </span>
            <span className="text-xs px-3 py-1.5 rounded-full bg-[var(--color-smokeblue-light)] text-[#3c5a6e] font-medium">
              {sales.length.toLocaleString()} Orders
            </span>
            {trueLatestDate && (
              <span className="text-xs px-3 py-1.5 rounded-full bg-[var(--color-corn-light)] text-[#8a6a1f] font-medium">
                📅 {formatDisplayDate(trueLatestDate)}
              </span>
            )}
          </div>

          <AsOfDatePicker />
          <ThemeToggle />
        </div>
      </div>

      {loading && (
        <div className="card p-10 text-center text-[var(--color-muted)]">
          Loading sales data from Supabase…
        </div>
      )}

      {error && (
        <div className="card p-6 border-[#e3a9a0] bg-[var(--color-dustypink-light)] text-[#8a4a44]">
          Couldn't load data: {error}
        </div>
      )}

      {!loading && !error && children}
    </div>
  )
}