import { motion } from 'framer-motion'

interface Variable {
  symbol: string
  name: string
  description: string
}

interface Props {
  title?: string
  formulas: string[]
  variables?: Variable[]
  highlightedVar?: string
}

export default function FormulaCard({ title, formulas, variables, highlightedVar }: Props) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {title && (
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>
          {title}
        </p>
      )}
      <div className="space-y-2 mb-4">
        {formulas.map((f, i) => (
          <div
            key={i}
            className="font-mono text-sm px-4 py-3 rounded-lg"
            style={{
              background: 'var(--code-bg)',
              border: '1px solid var(--code-border)',
              color: 'var(--code-text)',
            }}
          >
            {f}
          </div>
        ))}
      </div>
      {variables && variables.length > 0 && (
        <div className="space-y-1">
          {variables.map(v => (
            <motion.div
              key={v.symbol}
              animate={
                highlightedVar === v.symbol
                  ? { backgroundColor: 'var(--surface-raised)' }
                  : { backgroundColor: 'transparent' }
              }
              transition={{ duration: 0.15 }}
              className="flex gap-3 rounded-md px-3 py-1.5"
            >
              <span className="font-mono text-xs min-w-[2.5rem]" style={{ color: 'var(--text-3)' }}>
                {v.symbol}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-2)' }}>
                <span style={{ color: 'var(--text-1)', fontWeight: 500 }}>{v.name}</span>
                {v.description && <span> — {v.description}</span>}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
