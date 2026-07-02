export function SkeletonCard() {
  return (
    <div className="card p-4 flex flex-col gap-3 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-border)]" />
        <div className="h-3 w-20 rounded bg-[var(--color-border)]" />
      </div>
      <div className="h-7 w-32 rounded bg-[var(--color-border)]" />
      <div className="h-3 w-24 rounded bg-[var(--color-border)]" />
      <div className="h-8 w-full rounded bg-[var(--color-border)] mt-1" />
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="h-5 w-40 rounded bg-[var(--color-border)] mb-4" />
      <div className="h-[220px] w-full rounded-lg bg-[var(--color-border)]" />
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="h-5 w-48 rounded bg-[var(--color-border)] mb-4" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex justify-between py-3 border-t border-[var(--color-border)]">
          <div className="h-3 w-32 rounded bg-[var(--color-border)]" />
          <div className="h-3 w-20 rounded bg-[var(--color-border)]" />
          <div className="h-3 w-12 rounded bg-[var(--color-border)]" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonPage() {
  return (
    <div className="flex-1 px-4 md:px-8 py-4 md:py-6 w-full max-w-[1400px] pt-16 md:pt-6">
      {/* Header skeleton */}
      <div className="flex items-start justify-between mb-6 animate-pulse">
        <div>
          <div className="h-3 w-32 rounded bg-[var(--color-border)] mb-2" />
          <div className="h-7 w-48 rounded bg-[var(--color-border)] mb-2" />
          <div className="h-3 w-64 rounded bg-[var(--color-border)]" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-20 rounded-full bg-[var(--color-border)]" />
          <div className="h-8 w-24 rounded-full bg-[var(--color-border)]" />
          <div className="h-8 w-28 rounded-full bg-[var(--color-border)]" />
        </div>
      </div>

      {/* KPI cards row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        {[1,2,3,4,5,6].map((i) => <SkeletonCard key={i} />)}
      </div>

      {/* Chart row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2"><SkeletonChart /></div>
        <SkeletonChart />
      </div>

      {/* Tables row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkeletonTable />
        <SkeletonTable />
      </div>
    </div>
  )
}