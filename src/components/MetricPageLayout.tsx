import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  title: string
  module: string
  description: string
  formulaSection: ReactNode
  variableDictionary: ReactNode
  necessity: ReactNode
  calculator: ReactNode
  nominalRange: ReactNode
}

export default function MetricPageLayout({
  title, module, description,
  formulaSection, variableDictionary, necessity,
  calculator, nominalRange,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -8, filter: 'blur(2px)' }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span
              className="text-xs font-medium px-2.5 py-0.5 rounded-md"
              style={{
                background: 'var(--surface-raised)',
                color: 'var(--text-3)',
                border: '1px solid var(--border)',
              }}
            >
              {module}
            </span>
          </div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>{title}</h2>
          <p className="text-sm mt-1 max-w-2xl" style={{ color: 'var(--text-2)' }}>{description}</p>
        </div>
      </div>

      {/* Formula + Variable Dictionary */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-3)' }}>
            Faculty Formula
          </p>
          {formulaSection}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-3)' }}>
            Variable Dictionary
          </p>
          <div
            className="rounded-xl p-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            {variableDictionary}
          </div>
        </div>
      </div>

      {/* Why This Metric */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-3)' }}>
          Why This Metric Matters
        </p>
        <div
          className="rounded-xl p-5"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          {necessity}
        </div>
      </div>

      {/* Calculator */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-3)' }}>
          Interactive Calculator
        </p>
        {calculator}
      </div>

      {/* Nominal Range */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-3)' }}>
          Nominal Range &amp; Project Impact
        </p>
        {nominalRange}
      </div>
    </motion.div>
  )
}
