import { useState } from 'react'
import MetricPageLayout from '../components/MetricPageLayout'
import FormulaCard from '../components/FormulaCard'
import AnimatedNumber from '../components/AnimatedNumber'
import PresetToggle from '../components/PresetToggle'
import { calculatePERT, PERT_EVENTHUB_ACTIVITIES } from '../calculators/pert'
import type { PERTActivity } from '../calculators/pert'

const FACULTY_EXAMPLE: PERTActivity[] = [
  { id: 'A', label: 'Activity A', optimistic: 2, mostLikely: 4, pessimistic: 6, isCritical: true },
  { id: 'B', label: 'Activity B', optimistic: 1, mostLikely: 3, pessimistic: 5, isCritical: false },
  { id: 'C', label: 'Activity C', optimistic: 3, mostLikely: 5, pessimistic: 9, isCritical: true },
]

let nextId = 20
export default function PERTPage() {
  const [preset, setPreset] = useState<0 | 1>(0)
  const [activities, setActivities] = useState<PERTActivity[]>(PERT_EVENTHUB_ACTIVITIES)

  const handlePreset = (idx: 0 | 1) => {
    setPreset(idx)
    setActivities(idx === 0 ? PERT_EVENTHUB_ACTIVITIES : FACULTY_EXAMPLE)
  }

  const result = calculatePERT(activities)

  const update = (id: string, field: keyof PERTActivity, value: number | boolean | string) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a))
  }

  const addActivity = () => {
    setActivities(prev => [...prev, { id: String(nextId++), label: 'New Activity', optimistic: 2, mostLikely: 4, pessimistic: 8, isCritical: false }])
  }

  const removeActivity = (id: string) => setActivities(prev => prev.filter(a => a.id !== id))

  return (
    <MetricPageLayout
      title="Program Evaluation and Review Technique (PERT)"
      module="Module 2 & Module 4 — PERT"
      description="Probabilistic, event-oriented, network-based technique for estimating activity durations when uncertainty exists, using optimistic, most likely, and pessimistic time estimates."
      formulaSection={
        <FormulaCard
          formulas={[
            'te = (to + 4tm + tp) / 6',
            'σ = (tp − to) / 6',
            'σ² = ((tp − to) / 6)²',
            'Total Expected Time (Te) = Σ te  (critical path)',
            'Total Variance = Σ σ²  (critical path)',
          ]}
          variables={[
            { symbol: 'to', name: 'Optimistic Time', description: 'Minimum possible time (O)' },
            { symbol: 'tm', name: 'Most Likely Time', description: 'Normal completion time (m)' },
            { symbol: 'tp', name: 'Pessimistic Time', description: 'Maximum expected time (P)' },
            { symbol: 'te', name: 'Expected Time', description: 'Weighted estimate for the activity' },
            { symbol: 'σ', name: 'Std Deviation', description: 'Uncertainty spread of the estimate' },
            { symbol: 'σ²', name: 'Variance', description: 'Square of standard deviation' },
          ]}
        />
      }
      variableDictionary={
        <ul className="space-y-2 text-sm">
          {[
            ['to (O)', 'Optimistic time — minimum possible completion time if everything goes perfectly.'],
            ['tm (m)', 'Most likely time — the realistic, most probable completion time under normal conditions.'],
            ['tp (P)', 'Pessimistic time — maximum expected time if everything goes wrong.'],
            ['te', 'Weighted Expected Time for the activity = (O + 4m + P) / 6.'],
            ['σ', 'Standard Deviation measuring uncertainty in activity duration.'],
            ['σ²', 'Variance — square of standard deviation.'],
          ].map(([name, desc]) => (
            <li key={name}>
              <span className="font-mono font-semibold" style={{ color: 'var(--text-1)' }}>{name}: </span>
              <span style={{ color: 'var(--text-2)' }}>{desc}</span>
            </li>
          ))}
        </ul>
      }
      necessity={
        <div className="space-y-2 text-sm" style={{ color: 'var(--text-2)' }}>
          <p>PERT is a probabilistic, event-oriented, network-based technique used when activity durations are uncertain — as in EventHub's R&amp;D or new feature development — to estimate expected project duration, identify critical activities, and determine project completion probability.</p>
          <p className="font-semibold mt-3" style={{ color: 'var(--text-1)' }}>Faculty Nominal Guidance:</p>
          <ul className="list-disc list-inside">
            <li>Individual Activity Variance σ² {'<'} 4.0: Low schedule uncertainty</li>
            <li>Critical-path Activity Variance σ² ≥ 4.0: High uncertainty — requires closer monitoring and contingency buffers</li>
          </ul>
        </div>
      }
      calculator={
        <div className="rounded-xl p-6 space-y-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <PresetToggle
              options={[{ label: 'EventHub Preset' }, { label: 'Faculty Example' }]}
              selected={preset}
              onChange={handlePreset}
            />
            <button onClick={addActivity} className="text-xs px-3 py-2 rounded-xl"
              style={{ background: 'var(--ctrl-bg)', color: 'var(--text-2)', border: '1px solid var(--ctrl-border)' }}>
              + Activity
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b" style={{ color: 'var(--text-3)', borderColor: 'var(--border)' }}>
                  {['Activity', 'to (O)', 'tm (m)', 'tp (P)', 'te', 'σ', 'σ²', 'Critical?', ''].map(h => (
                    <th key={h} className="text-left pb-2 pr-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.activities.map(a => {
                  const highVar = a.variance >= 4.0
                  return (
                    <tr key={a.id} className="border-b" style={{ borderColor: 'var(--border)', color: a.isCritical ? 'var(--text-1)' : 'var(--text-2)' }}>
                      <td className="py-2 pr-3">
                        <input value={a.label} onChange={e => update(a.id, 'label', e.target.value)}
                          className="w-28 bg-transparent outline-none text-xs border-b"
                          style={{ borderColor: 'var(--border)', color: 'inherit' }} />
                      </td>
                      {(['optimistic', 'mostLikely', 'pessimistic'] as const).map(field => (
                        <td key={field} className="py-2 pr-3">
                          <input type="number" value={a[field]} min={0} step={0.5}
                            onChange={e => update(a.id, field, parseFloat(e.target.value) || 0)}
                            className="w-14 rounded-lg px-2 py-1 text-xs font-mono outline-none"
                            style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', color: 'var(--text-1)' }} />
                        </td>
                      ))}
                      <td className="py-2 pr-3 font-mono font-bold">{a.expectedTime.toFixed(2)}</td>
                      <td className="py-2 pr-3 font-mono">{a.standardDeviation.toFixed(3)}</td>
                      <td className="py-2 pr-3 font-mono" style={{ color: highVar ? 'var(--s-warn)' : 'inherit', fontWeight: highVar ? 700 : undefined }}>{a.variance.toFixed(3)}</td>
                      <td className="py-2 pr-3">
                        <input type="checkbox" checked={a.isCritical ?? false}
                          onChange={e => update(a.id, 'isCritical', e.target.checked)} />
                      </td>
                      <td className="py-2">
                        <button onClick={() => removeActivity(a.id)} className="transition-colors" style={{ color: 'var(--text-3)' }}>×</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="text-center p-4 rounded-xl" style={{ background: 'var(--surface-raised)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-3)' }}>Total Expected Time (Te)</p>
              <AnimatedNumber value={result.totalExpectedTime} decimals={2} suffix=" units" className="text-xl font-bold" style={{ color: 'var(--text-1)' } as React.CSSProperties} />
            </div>
            <div className="text-center p-4 rounded-xl" style={{ background: 'var(--surface-raised)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-3)' }}>Total Variance (Σσ²)</p>
              <AnimatedNumber value={result.totalVariance} decimals={3} className="text-xl font-bold" style={{ color: result.totalVariance >= 4 ? 'var(--s-warn)' : 'var(--s-pass)' } as React.CSSProperties} />
            </div>
            <div className="text-center p-4 rounded-xl" style={{ background: 'var(--surface-raised)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-3)' }}>Total Std Dev (Σσ²)^½</p>
              <AnimatedNumber value={result.totalStdDev} decimals={3} className="text-xl font-bold" style={{ color: 'var(--text-1)' } as React.CSSProperties} />
            </div>
          </div>
        </div>
      }
      nominalRange={
        <div className="rounded-xl p-5" style={{
          background: result.totalVariance >= 4 ? 'var(--s-warn-bg)' : 'var(--s-pass-bg)',
          border: `1px solid ${result.totalVariance >= 4 ? 'var(--s-warn-border)' : 'var(--s-pass-border)'}`,
        }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Schedule Uncertainty</p>
            <span className="text-xs font-bold px-3 py-1 rounded-full"
              style={{
                color: result.totalVariance >= 4 ? 'var(--s-warn)' : 'var(--s-pass)',
                background: result.totalVariance >= 4 ? 'var(--s-warn-bg)' : 'var(--s-pass-bg)',
              }}>
              {result.totalVariance >= 4 ? 'HIGH VARIANCE — Monitor' : 'LOW VARIANCE — Stable'}
            </span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>
            Total critical path expected time: <span className="font-mono font-bold" style={{ color: 'var(--text-1)' }}>{result.totalExpectedTime.toFixed(2)} units</span>.
            Total variance: <span className="font-mono font-bold" style={{ color: result.totalVariance >= 4 ? 'var(--s-warn)' : 'var(--s-pass)' }}>{result.totalVariance.toFixed(3)}</span>.
            {result.totalVariance >= 4
              ? ' High variance on the critical path signals a wide spread between optimistic and pessimistic estimates — add contingency buffers.'
              : ' Low variance suggests stable estimates with manageable schedule uncertainty.'}
          </p>
        </div>
      }
    />
  )
}
