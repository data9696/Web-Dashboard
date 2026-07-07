import { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext'

export function LoadingScreen() {
  const [progress, setProgress] = useState(8)
  const { profile } = useAuth()
  const name = profile?.full_name || profile?.email || ''

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => (p < 92 ? p + (92 - p) * 0.08 : p))
    }, 200)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--color-cream)] overflow-hidden">
      <div className="blob blob-sage" />
      <div className="blob blob-pink" />
      <div className="blob blob-blue" />

      <div className="relative flex items-center justify-center z-10 w-36 h-36">
        <div className="loader-ring" />
        <div className="logo-card logo-pop">
          <img
            src="/assets/fashion1972ne-logo.png"
            alt="Fashion 1972NE"
            className="logo-cropped"
          />
        </div>
      </div>

      <div className="mt-6 font-display text-2xl text-[var(--color-sage-dark)] z-10">
        Fashion 1972NE
      </div>
      <div className="text-sm text-[var(--color-muted)] mt-1 z-10">
        Cocoon Care · The Boo Boo Club
      </div>

      {name && (
        <div className="mt-4 z-10 text-sm text-[var(--color-sage-dark)] font-medium">
          Welcome back, {name} 👋
        </div>
      )}

      <div className="mt-6 w-56 h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden z-10">
        <div
          className="h-full rounded-full bg-[var(--color-sage)] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-xs text-[var(--color-muted)] mt-3 z-10">
        Syncing today's sales from Supabase…
      </div>
    </div>
  )
}
