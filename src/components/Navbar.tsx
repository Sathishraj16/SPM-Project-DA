import { motion } from 'framer-motion'
import { ExternalLink, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const TABS = [
  { id: 0,  label: 'Overview' },
  { id: 1,  label: '1. CBA' },
  { id: 2,  label: '2. Cash Flow' },
  { id: 3,  label: '3. Payback & ROI' },
  { id: 4,  label: '4. NPV' },
  { id: 5,  label: '5. BCR' },
  { id: 6,  label: '6. IRR' },
  { id: 7,  label: '7. Risk' },
  { id: 8,  label: '8. CPM' },
  { id: 9,  label: '9. Crashing' },
  { id: 10, label: '10. PERT' },
  { id: 11, label: '11. FPA' },
  { id: 12, label: '12. Object Points' },
]

interface Props {
  activeTab: number
  onTabChange: (id: number) => void
}

export default function Navbar({ activeTab, onTabChange }: Props) {
  const { theme, toggleTheme } = useTheme()

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--nav-border)',
      }}
    >
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex items-center gap-4 h-14">
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
              EventHub <span style={{ color: 'var(--text-3)' }}>//</span> SPM Studio
            </span>
            <a
              href="https://github.com/mohnish-exe/eventhub"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md transition-colors"
              style={{
                background: 'var(--surface-raised)',
                color: 'var(--text-3)',
                border: '1px solid var(--border)',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
            >
              GitHub <ExternalLink size={10} />
            </a>
          </div>

          <div className="w-px h-5 shrink-0" style={{ background: 'var(--border)' }} />

          {/* Tabs */}
          <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-thin flex-1 pb-0">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap"
                style={{ color: activeTab === tab.id ? 'var(--text-1)' : 'var(--text-3)' }}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-md"
                    style={{
                      background: 'var(--active-bg)',
                      border: '1px solid var(--active-border)',
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="shrink-0 p-2 rounded-md transition-colors"
            style={{
              background: 'var(--ctrl-bg)',
              border: '1px solid var(--ctrl-border)',
              color: 'var(--text-2)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--ctrl-bg-hover)'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-1)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--ctrl-bg)'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-2)'
            }}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </div>
    </nav>
  )
}
