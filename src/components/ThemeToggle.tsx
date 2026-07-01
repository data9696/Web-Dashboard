import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

function getInitialTheme(): boolean {
  const stored = localStorage.getItem('theme')
  if (stored) return stored === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return (
    <button
      onClick={() => setIsDark((d) => !d)}
      className="w-9 h-9 rounded-full flex items-center justify-center border border-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--color-cream)] transition-colors"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}