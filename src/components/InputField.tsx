interface Props {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  prefix?: string
  suffix?: string
  onFocus?: () => void
  onBlur?: () => void
}

export default function InputField({ label, value, onChange, min, max, step = 1, prefix, suffix, onFocus, onBlur }: Props) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium" style={{ color: 'var(--text-3)' }}>{label}</label>
      <div className="flex items-center gap-1.5">
        {prefix && <span className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>{prefix}</span>}
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={e => {
            const v = parseFloat(e.target.value)
            if (!isNaN(v)) onChange(v)
          }}
          className="w-full rounded-md px-3 py-2 text-sm font-mono outline-none transition-colors"
          style={{
            background: 'var(--surface-raised)',
            border: '1px solid var(--border)',
            color: 'var(--text-1)',
          }}
          onFocusCapture={e => {
            e.currentTarget.style.borderColor = 'var(--border-strong)'
          }}
          onBlurCapture={e => {
            e.currentTarget.style.borderColor = 'var(--border)'
          }}
        />
        {suffix && <span className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>{suffix}</span>}
      </div>
    </div>
  )
}
