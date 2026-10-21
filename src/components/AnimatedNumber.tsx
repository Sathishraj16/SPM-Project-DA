import { useEffect, useRef, useState } from 'react'

import type { CSSProperties } from 'react'

interface Props {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
  style?: CSSProperties
}

export default function AnimatedNumber({ value, decimals = 0, prefix = '', suffix = '', className = '', style }: Props) {
  const [displayed, setDisplayed] = useState(value)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)
  const startValRef = useRef(value)

  useEffect(() => {
    const startVal = displayed
    startValRef.current = startVal
    startRef.current = null

    const duration = 400

    function step(ts: number) {
      if (!startRef.current) startRef.current = ts
      const elapsed = ts - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setDisplayed(startVal + (value - startVal) * ease)
      if (progress < 1) rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [value])

  const formatted = isFinite(displayed)
    ? displayed.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : '—'

  return (
    <span className={`font-mono tabular-nums ${className}`} style={style}>
      {prefix}{formatted}{suffix}
    </span>
  )
}
