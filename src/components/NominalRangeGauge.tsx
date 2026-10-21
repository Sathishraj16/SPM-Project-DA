import { motion } from 'framer-motion'

interface Props {
  value: number
  min: number
  max: number
  label?: string
  unit?: string
  status: 'accept' | 'warn' | 'reject'
  statusLabel: string
  message: string
}

export default function NominalRangeGauge({ value, min, max, label, unit, status, statusLabel, message }: Props) {
  const pct = max === min ? 0 : Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))

  const cssVars = {
    accept: { text: 'var(--s-pass)', bg: 'var(--s-pass-bg)', border: 'var(--s-pass-border)' },
    warn:   { text: 'var(--s-warn)', bg: 'var(--s-warn-bg)', border: 'var(--s-warn-border)' },
    reject: { text: 'var(--s-fail)', bg: 'var(--s-fail-bg)', border: 'var(--s-fail-border)' },
  }
  const c = cssVars[status]

  return (
    <div
      className="rounded-xl p-5 space-y-4"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: 'var(--text-2)' }}>{label ?? 'Result'}</span>
        <span
          className="text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
          style={{ color: c.text, background: c.bg, border: `1px solid ${c.border}` }}
        >
          {statusLabel}
        </span>
      </div>

      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: c.text }}
          initial={{ width: '0%' }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      <div className="flex justify-between text-xs" style={{ color: 'var(--text-3)' }}>
        <span>{unit ? `${min} ${unit}` : min}</span>
        <span className="font-mono font-semibold" style={{ color: c.text }}>
          {value.toLocaleString('en-US', { maximumFractionDigits: 2 })}{unit ? ` ${unit}` : ''}
        </span>
        <span>{unit ? `${max} ${unit}` : max}</span>
      </div>

      <p className="text-sm leading-relaxed" style={{ color: c.text }}>{message}</p>
    </div>
  )
}
