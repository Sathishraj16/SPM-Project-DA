import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Printer } from 'lucide-react'

interface MetricsSnapshot {
  cba?:          { netBenefits: number; accepted: boolean }
  cashflow?:     { closingCashBalance: number; healthy: boolean }
  npv?:          { npv: number; accepted: boolean }
  bcr?:          { bcr: number }
  irr?:          { irr: number }
  fpa?:          { fp: number }
  objectPoints?: { effort: number }
  cpm?:          { projectDuration: number }
}

interface Props {
  metricsSnapshot: MetricsSnapshot
}

type BadgeStatus = 'PASS' | 'FAIL' | 'WARN' | 'INFO'

function StatusBadge({ status }: { status: BadgeStatus }) {
  const styles: Record<BadgeStatus, { bg: string; color: string; border: string }> = {
    PASS: { bg: 'var(--s-pass-bg)',  color: 'var(--s-pass)',  border: 'var(--s-pass-border)' },
    FAIL: { bg: 'var(--s-fail-bg)',  color: 'var(--s-fail)',  border: 'var(--s-fail-border)' },
    WARN: { bg: 'var(--s-warn-bg)',  color: 'var(--s-warn)',  border: 'var(--s-warn-border)' },
    INFO: { bg: 'var(--surface-raised)', color: 'var(--text-3)', border: 'var(--border)' },
  }
  const s = styles[status]
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {status}
    </span>
  )
}

export default function ExportModal({ metricsSnapshot }: Props) {
  const [open, setOpen] = useState(false)
  const reportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const rows = [
    { metric: '1. Cost-Benefit Analysis',  value: metricsSnapshot.cba ? `Net Benefits: ₹${metricsSnapshot.cba.netBenefits.toLocaleString()}` : '—', status: metricsSnapshot.cba ? (metricsSnapshot.cba.accepted ? 'PASS' : 'FAIL') : 'INFO', rule: 'Net Benefits > 0 → Accept' },
    { metric: '2. Cash Flow Forecast',      value: metricsSnapshot.cashflow ? `Closing Balance: ₹${metricsSnapshot.cashflow.closingCashBalance.toLocaleString()}` : '—', status: metricsSnapshot.cashflow ? (metricsSnapshot.cashflow.healthy ? 'PASS' : 'FAIL') : 'INFO', rule: 'Closing Balance > 0 → Healthy' },
    { metric: '3. Payback Period & ROI',    value: '—', status: 'INFO' as const, rule: 'Payback < lifecycle; ROI > 15%' },
    { metric: '4. NPV',                     value: metricsSnapshot.npv ? `NPV: ₹${metricsSnapshot.npv.npv.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '—', status: metricsSnapshot.npv ? (metricsSnapshot.npv.accepted ? 'PASS' : 'FAIL') : 'INFO', rule: 'NPV > 0 → Accept' },
    { metric: '5. BCR',                     value: metricsSnapshot.bcr ? `BCR: ${metricsSnapshot.bcr.bcr.toFixed(3)}` : '—', status: metricsSnapshot.bcr ? (metricsSnapshot.bcr.bcr > 1 ? 'PASS' : 'FAIL') : 'INFO', rule: 'BCR > 1.0 → Accept' },
    { metric: '6. IRR',                     value: metricsSnapshot.irr ? `IRR: ${metricsSnapshot.irr.irr.toFixed(2)}%` : '—', status: 'INFO' as const, rule: 'IRR > Required Rate → Accept' },
    { metric: '7. Risk Exposure',           value: '—', status: 'INFO' as const, rule: 'Low/Medium/High — qualitative' },
    { metric: '8. CPM Network',             value: metricsSnapshot.cpm ? `Duration: ${metricsSnapshot.cpm.projectDuration} weeks` : '—', status: 'INFO' as const, rule: 'Critical path TF = 0' },
    { metric: '9. Project Crashing',        value: '—', status: 'INFO' as const, rule: 'Prioritize lowest cost slope' },
    { metric: '10. PERT Estimation',        value: '—', status: 'INFO' as const, rule: 'σ² < 4.0 = low uncertainty' },
    { metric: '11. Function Points',        value: metricsSnapshot.fpa ? `FP: ${metricsSnapshot.fpa.fp.toFixed(1)}` : '—', status: metricsSnapshot.fpa ? (metricsSnapshot.fpa.fp >= 150 && metricsSnapshot.fpa.fp <= 400 ? 'PASS' : 'WARN') : 'INFO', rule: 'Nominal: 150–400 FP' },
    { metric: '12. Object Points',          value: metricsSnapshot.objectPoints ? `Effort: ${metricsSnapshot.objectPoints.effort.toFixed(3)} P/M` : '—', status: 'INFO' as const, rule: 'Reuse 10–30%, PROD 7–25' },
  ] as { metric: string; value: string; status: BadgeStatus; rule: string }[]

  return (
    <>
      {/* Floating export button */}
      <motion.button
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-strong)',
          color: 'var(--text-1)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(true)}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-raised)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface)'
        }}
      >
        <Download size={14} />
        Export SPM Report
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
              onClick={() => setOpen(false)}
            />

            {/* Modal panel */}
            <motion.div
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
              }}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-8 print-content">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>EventHub SPM Report</h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>Generated: {reportDate}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Project: EventHub — Event Management &amp; Ticketing Platform</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.print()}
                      className="p-2 rounded-md transition-colors"
                      style={{
                        background: 'var(--surface-raised)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-3)',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
                    >
                      <Printer size={16} />
                    </button>
                    <button
                      onClick={() => setOpen(false)}
                      className="p-2 rounded-md transition-colors"
                      style={{
                        background: 'var(--surface-raised)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-3)',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Summary table */}
                <div className="space-y-2 mb-8">
                  <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-3)' }}>
                    Executive Summary — 12 Metrics
                  </p>
                  {rows.map((row, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-3 px-4 rounded-lg"
                      style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)' }}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{row.metric}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{row.rule}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-mono" style={{ color: 'var(--text-2)' }}>{row.value}</span>
                        <StatusBadge status={row.status} />
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="text-xs border-t pt-4"
                  style={{ color: 'var(--text-3)', borderColor: 'var(--border)' }}
                >
                  <p>⚠ Important: This report summarizes demonstration estimates based on preset input values. All calculations follow the faculty-provided formulas. Presets labeled "EventHub" are demonstration estimates, not audited measurements.</p>
                  <p className="mt-2">STATUS legend: PASS = meets faculty accept criterion | FAIL = does not meet criterion | WARN = outside nominal range | INFO = qualitative — no universal numerical threshold</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
