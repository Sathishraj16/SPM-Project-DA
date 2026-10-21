import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  title?: string
  onClick?: () => void
  animate?: boolean
}

const cardStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
}

export default function GlassCard({ children, className = '', title, onClick, animate = true }: Props) {
  const content = (
    <div
      style={cardStyle}
      className={`rounded-xl p-6 ${onClick ? 'cursor-pointer transition-colors hover:brightness-105' : ''} ${className}`}
      onClick={onClick}
    >
      {title && (
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-3)' }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  )

  if (!animate) return content

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={cardStyle}
      className={`rounded-xl p-6 ${onClick ? 'cursor-pointer transition-colors hover:brightness-105' : ''} ${className}`}
      onClick={onClick}
    >
      {title && (
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-3)' }}>
          {title}
        </h3>
      )}
      {children}
    </motion.div>
  )
}
