import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Edit3 } from 'lucide-react'
import MetricPageLayout from '../components/MetricPageLayout'
import FormulaCard from '../components/FormulaCard'
import { calculateRisk, DEFAULT_EVENTHUB_RISKS, DEFAULT_RISK_THRESHOLDS } from '../calculators/risk'
import type { RiskItem, RiskCategory, RiskThresholds } from '../calculators/risk'

const CATEGORIES: RiskCategory[] = ['Technical', 'Project', 'Business', 'Internal/External']

const LEVEL_COLORS = {
  Low: 'var(--s-pass)',
  Medium: 'var(--s-warn)',
  High: 'var(--s-fail)',
}
const LEVEL_BG = {
  Low: 'var(--s-pass-bg)',
  Medium: 'var(--s-warn-bg)',
  High: 'var(--s-fail-bg)',
}
const LEVEL_BORDER = {
  Low: 'var(--s-pass-border)',
  Medium: 'var(--s-warn-border)',
  High: 'var(--s-fail-border)',
}

function RiskMatrixCell({ p, i, risks, thresholds }: { p: number; i: number; risks: ReturnType<typeof calculateRisk>[]; thresholds: RiskThresholds }) {
  const count = risks.filter(r => Math.round(r.probability * 10) === p && Math.round(r.impact) === i).length
  const exposure = p * i / 10
  const color = exposure <= thresholds.lowMax ? 'var(--s-pass)' : exposure <= thresholds.medMax ? 'var(--s-warn)' : 'var(--s-fail)'
  const bg = exposure <= thresholds.lowMax ? 'var(--s-pass-bg)' : exposure <= thresholds.medMax ? 'var(--s-warn-bg)' : 'var(--s-fail-bg)'
  const border = exposure <= thresholds.lowMax ? 'var(--s-pass-border)' : exposure <= thresholds.medMax ? 'var(--s-warn-border)' : 'var(--s-fail-border)'
  return (
    <div className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition-all"
      style={{
        background: count > 0 ? bg : 'var(--surface-raised)',
        border: `1px solid ${count > 0 ? border : 'var(--border)'}`,
        color: count > 0 ? color : 'var(--text-3)',
      }}>
      {count > 0 ? count : ''}
    </div>
  )
}

let nextId = 6
export default function RiskPage() {
  const [risks, setRisks] = useState<RiskItem[]>(DEFAULT_EVENTHUB_RISKS)
  const [filter, setFilter] = useState<RiskCategory | 'All'>('All')
  const [editing, setEditing] = useState<string | null>(null)
  const [newRisk, setNewRisk] = useState<Omit<RiskItem, 'id'>>({ description: '', category: 'Technical', probability: 0.3, impact: 5 })
  const [thresholds, setThresholds] = useState<RiskThresholds>(DEFAULT_RISK_THRESHOLDS)

  const results = risks.map(r => calculateRisk(r, thresholds))
  const filtered = filter === 'All' ? results : results.filter(r => r.category === filter)
  const sorted = [...filtered].sort((a, b) => b.exposure - a.exposure)

  const addRisk = () => {
    if (!newRisk.description.trim()) return
    setRisks(prev => [...prev, { ...newRisk, id: String(nextId++) }])
    setNewRisk({ description: '', category: 'Technical', probability: 0.3, impact: 5 })
  }

  const deleteRisk = (id: string) => setRisks(prev => prev.filter(r => r.id !== id))

  const updateRisk = (id: string, updates: Partial<RiskItem>) => {
    setRisks(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
  }

  const pLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  const iLevels = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]

  return (
    <MetricPageLayout
      title="Risk Exposure & Hazard Assessment Matrix"
      module="Module 2 — Risk Evaluation & Module 4 — Risk Management"
      description="Systematic process of identifying hazards, assessing probability and impact, prioritizing risks, and developing mitigation strategies."
      formulaSection={
        <FormulaCard
          formulas={['Risk Exposure = Probability × Impact']}
          variables={[
            { symbol: 'P', name: 'Probability', description: 'Likelihood of the uncertain event occurring (0.0 to 1.0, or scale 1–10)' },
            { symbol: 'I', name: 'Impact', description: 'Magnitude of negative impact on scope, schedule, cost, or quality (1–10)' },
          ]}
        />
      }
      variableDictionary={
        <ul className="space-y-3 text-sm">
          {[
            ['Probability', 'Likelihood of the risk event occurring. Rated 0.0 to 1.0 in this calculator.'],
            ['Impact', 'Severity of the risk consequence on the project. Rated 1–10.'],
            ['Risk Exposure', 'Quantified risk priority score = P × I, used to populate the Risk Register and Risk Matrix.'],
          ].map(([name, desc]) => (
            <li key={name}>
              <span className="font-semibold" style={{ color: 'var(--text-1)' }}>{name}: </span>
              <span style={{ color: 'var(--text-2)' }}>{desc}</span>
            </li>
          ))}
        </ul>
      }
      necessity={
        <div className="space-y-2 text-sm" style={{ color: 'var(--text-2)' }}>
          <p>Risk management is a systematic process of identifying hazards, assessing probability and impact, prioritizing risks, and developing suitable mitigation to reduce uncertainty.</p>
          <p className="font-semibold mt-3" style={{ color: 'var(--text-1)' }}>Faculty Evaluation Rules (Qualitative):</p>
          <ul className="space-y-1">
            <li><span className="font-semibold" style={{ color: 'var(--s-pass)' }}>Low Risk:</span> Accept / Monitor regularly</li>
            <li><span className="font-semibold" style={{ color: 'var(--s-warn)' }}>Medium Risk:</span> Risk Reduction / Mitigation or Transfer</li>
            <li><span className="font-semibold" style={{ color: 'var(--s-fail)' }}>High Risk:</span> Immediate Mitigation or Risk Avoidance</li>
          </ul>
          <p className="text-xs mt-2" style={{ color: 'var(--text-3)' }}>Note: Low/Medium/High boundaries above are configurable display thresholds, not fixed faculty rules.</p>
        </div>
      }
      calculator={
        <div className="space-y-6">
          <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Add New Risk</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs" style={{ color: 'var(--text-3)' }}>Risk Description</label>
                <input value={newRisk.description}
                  onChange={e => setNewRisk(p => ({ ...p, description: e.target.value }))}
                  placeholder="Describe the risk event..."
                  className="w-full mt-1 rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                />
              </div>
              <div>
                <label className="text-xs" style={{ color: 'var(--text-3)' }}>Category</label>
                <select value={newRisk.category}
                  onChange={e => setNewRisk(p => ({ ...p, category: e.target.value as RiskCategory }))}
                  className="w-full mt-1 rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ background: 'var(--ctrl-bg)', border: '1px solid var(--ctrl-border)', color: 'var(--text-1)' }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs" style={{ color: 'var(--text-3)' }}>Probability: {newRisk.probability.toFixed(1)}</label>
                <input type="range" min={0.1} max={1.0} step={0.1} value={newRisk.probability}
                  onChange={e => setNewRisk(p => ({ ...p, probability: parseFloat(e.target.value) }))}
                  className="w-full mt-1" />
              </div>
              <div>
                <label className="text-xs" style={{ color: 'var(--text-3)' }}>Impact: {newRisk.impact}</label>
                <input type="range" min={1} max={10} step={1} value={newRisk.impact}
                  onChange={e => setNewRisk(p => ({ ...p, impact: parseInt(e.target.value) }))}
                  className="w-full mt-1" />
              </div>
            </div>
            <button onClick={addRisk} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
              style={{ background: 'var(--active-bg)', border: '1px solid var(--active-border)', color: 'var(--text-1)' }}>
              <Plus size={14} /> Add Risk
            </button>
          </div>

          <div className="flex gap-2 flex-wrap">
            {(['All', ...CATEGORIES] as (RiskCategory | 'All')[]).map(c => (
              <button key={c} onClick={() => setFilter(c)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: filter === c ? 'var(--active-bg)' : 'var(--ctrl-bg)',
                  border: `1px solid ${filter === c ? 'var(--active-border)' : 'var(--ctrl-border)'}`,
                  color: filter === c ? 'var(--text-1)' : 'var(--text-3)',
                }}>
                {c}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {sorted.map(risk => (
                <motion.div key={risk.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="rounded-xl p-4"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  {editing === risk.id ? (
                    <div className="space-y-3">
                      <input value={risk.description}
                        onChange={e => updateRisk(risk.id, { description: e.target.value })}
                        className="w-full rounded-lg px-3 py-1.5 text-sm outline-none"
                        style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', color: 'var(--text-1)' }} />
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <label style={{ color: 'var(--text-3)' }}>Probability: {risk.probability.toFixed(1)}</label>
                          <input type="range" min={0.1} max={1.0} step={0.1} value={risk.probability}
                            onChange={e => updateRisk(risk.id, { probability: parseFloat(e.target.value) })} className="w-full" />
                        </div>
                        <div>
                          <label style={{ color: 'var(--text-3)' }}>Impact: {risk.impact}</label>
                          <input type="range" min={1} max={10} step={1} value={risk.impact}
                            onChange={e => updateRisk(risk.id, { impact: parseInt(e.target.value) })} className="w-full" />
                        </div>
                        <div>
                          <label style={{ color: 'var(--text-3)' }}>Category</label>
                          <select value={risk.category}
                            onChange={e => updateRisk(risk.id, { category: e.target.value as RiskCategory })}
                            className="w-full rounded px-2 py-1 text-xs outline-none"
                            style={{ background: 'var(--ctrl-bg)', border: '1px solid var(--ctrl-border)', color: 'var(--text-1)' }}>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                      <button onClick={() => setEditing(null)} className="text-xs px-3 py-1.5 rounded-lg"
                        style={{ background: 'var(--s-pass-bg)', border: '1px solid var(--s-pass-border)', color: 'var(--s-pass)' }}>
                        Done
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: 'var(--surface-raised)', color: 'var(--text-2)', border: '1px solid var(--border)' }}>
                            {risk.category}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{ color: LEVEL_COLORS[risk.level], background: LEVEL_BG[risk.level], border: `1px solid ${LEVEL_BORDER[risk.level]}` }}>
                            {risk.level} — Exposure: {risk.exposure.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--text-1)' }}>{risk.description}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>P: {risk.probability.toFixed(1)} × I: {risk.impact} = {risk.exposure.toFixed(1)}</p>
                        <p className="text-xs mt-1" style={{ color: LEVEL_COLORS[risk.level] }}>{risk.mitigation}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => setEditing(risk.id)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-3)' }}>
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => deleteRisk(risk.id)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-3)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      }
      nominalRange={
        <div className="space-y-4">
          <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-3)' }}>Display Thresholds (user-configurable — not fixed faculty rules)</p>
            <div className="flex gap-6 flex-wrap">
              <label className="flex items-center gap-3 text-xs">
                <span className="w-24" style={{ color: 'var(--s-pass)' }}>Low/Medium ≤</span>
                <input type="number" value={thresholds.lowMax} min={0.1} max={thresholds.medMax - 0.1} step={0.5}
                  onChange={e => setThresholds(prev => ({ ...prev, lowMax: Number(e.target.value) }))}
                  className="w-16 rounded-lg px-2 py-1 text-sm font-mono outline-none"
                  style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', color: 'var(--text-1)' }} />
              </label>
              <label className="flex items-center gap-3 text-xs">
                <span className="w-24" style={{ color: 'var(--s-warn)' }}>Medium/High ≤</span>
                <input type="number" value={thresholds.medMax} min={thresholds.lowMax + 0.1} max={9.9} step={0.5}
                  onChange={e => setThresholds(prev => ({ ...prev, medMax: Number(e.target.value) }))}
                  className="w-16 rounded-lg px-2 py-1 text-sm font-mono outline-none"
                  style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', color: 'var(--text-1)' }} />
              </label>
              <button onClick={() => setThresholds(DEFAULT_RISK_THRESHOLDS)}
                className="text-xs px-3 py-1 rounded-lg"
                style={{ background: 'var(--ctrl-bg)', border: '1px solid var(--ctrl-border)', color: 'var(--text-3)' }}>
                Reset defaults
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Risk Summary</p>
              <div className="grid grid-cols-3 gap-3">
                {(['Low', 'Medium', 'High'] as const).map(level => {
                  const count = results.filter(r => r.level === level).length
                  return (
                    <div key={level} className="text-center p-3 rounded-xl" style={{ background: LEVEL_BG[level], border: `1px solid ${LEVEL_BORDER[level]}` }}>
                      <p className="text-2xl font-black" style={{ color: LEVEL_COLORS[level] }}>{count}</p>
                      <p className="text-xs" style={{ color: LEVEL_COLORS[level] }}>{level} Risk</p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-1)' }}>Risk Matrix (P × I)</p>
              <div className="flex gap-1">
                <div className="flex flex-col gap-1 mr-1">
                  {iLevels.map(i => <div key={i} className="w-5 h-8 flex items-center justify-end text-xs" style={{ color: 'var(--text-3)' }}>{i}</div>)}
                </div>
                <div className="space-y-1">
                  {iLevels.map(i => (
                    <div key={i} className="flex gap-1">
                      {pLevels.map(p => <RiskMatrixCell key={p} p={p} i={i} risks={results} thresholds={thresholds} />)}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-1 mt-1 ml-6">
                {pLevels.map(p => <div key={p} className="w-8 text-center text-xs" style={{ color: 'var(--text-3)' }}>{p/10}</div>)}
              </div>
              <p className="text-xs mt-1 ml-6" style={{ color: 'var(--text-3)' }}>Probability →</p>
            </div>
          </div>
        </div>
      }
    />
  )
}
