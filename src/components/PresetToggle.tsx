import { motion } from 'framer-motion'

interface Option {
  label: string
  description?: string
}

interface Props {
  options: [Option, Option]
  selected: 0 | 1
  onChange: (index: 0 | 1) => void
}

export default function PresetToggle({ options, selected, onChange }: Props) {
  return (
    <div
      className="inline-flex relative rounded-lg p-0.5 gap-0.5"
      style={{
        background: 'var(--surface-raised)',
        border: '1px solid var(--border)',
      }}
    >
      {options.map((opt, i) => (
        <button
          key={i}
          onClick={() => onChange(i as 0 | 1)}
          className="relative px-3 py-1.5 rounded-md text-sm font-medium transition-colors z-10"
          style={{ color: selected === i ? 'var(--text-1)' : 'var(--text-3)' }}
        >
          {selected === i && (
            <motion.div
              layoutId="preset-pill"
              className="absolute inset-0 rounded-md"
              style={{
                background: 'var(--active-bg)',
                border: '1px solid var(--active-border)',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            />
          )}
          <span className="relative z-10">{opt.label}</span>
        </button>
      ))}
    </div>
  )
}
