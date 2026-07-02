import { useEffect, useRef, useState } from 'react'

export function useCountUp(target: number, duration = 1500): number {
  const [current, setCurrent] = useState(target)
  const rafRef = useRef<number | undefined>(undefined)
  const startRef = useRef<number | undefined>(undefined)
  const prevTarget = useRef<number>(target)
  const firstRun = useRef(true)

  useEffect(() => {
    // First render — show value instantly, no animation
    if (firstRun.current) {
      firstRun.current = false
      setCurrent(target)
      prevTarget.current = target
      return
    }

    if (target === prevTarget.current) return
    const from = prevTarget.current
    prevTarget.current = target

    const animate = (ts: number) => {
      if (startRef.current === undefined) startRef.current = ts
      const elapsed = ts - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(Math.round(from + (target - from) * eased))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    startRef.current = undefined
    if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration])

  return current
}