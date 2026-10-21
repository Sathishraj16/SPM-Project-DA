import { useState } from 'react'
import MetricPageLayout from '../components/MetricPageLayout'
import FormulaCard from '../components/FormulaCard'
import AnimatedNumber from '../components/AnimatedNumber'
import NominalRangeGauge from '../components/NominalRangeGauge'
import PresetToggle from '../components/PresetToggle'
import { calculateObjectPoints, OP_FACULTY_EXAMPLE, OP_EVENTHUB_COMPONENTS, isWeightSpecified } from '../calculators/objectPoints'
import type { OPComponent, OPType, OPComplexity, ProductivityLevel } from '../calculators/objectPoints'

const OP_WEIGHTS: Record<string, Record<string, number | null>> = {
  Screen: { Simple: 1, Medium: 2, Difficult: 3 },
  Report: { Simple: 2, Medium: 5, Difficult: 8 },
  '3GL':  { Simple: null, Medium: null, Difficult: 10 },
}

const PROD_LEVELS: ProductivityLevel[] = ['Very Low', 'Low', 'Nominal', 'High', 'Very High']
const PROD_RATES: Record<ProductivityLevel, number> = { 'Very Low': 4, 'Low': 7, 'Nominal': 13, 'High': 25, 'Very High': 50 }
const TYPES: OPType[] = ['Screen', 'Report', '3GL']
const COMPLEXITIES: OPComplexity[] = ['Simple', 'Medium', 'Difficult']

export default function ObjectPointsPage() {
  const [preset, setPreset] = useState<0 | 1>(0)
  const [components, setComponents] = useState<OPComponent[]>(OP_EVENTHUB_COMPONENTS)
  const [reuse, setReuse] = useState(20)
  const [prodLevel, setProdLevel] = useState<ProductivityLevel>('Nominal')

  const handlePreset = (idx: 0 | 1) => {
    setPreset(idx)
    if (idx === 0) {
      setComponents(OP_EVENTHUB_COMPONENTS)
      setReuse(20)
      setProdLevel('Nominal')
    } else {
      setComponents(OP_FACULTY_EXAMPLE.components)
      setReuse(OP_FACULTY_EXAMPLE.reuse)
      setProdLevel(OP_FACULTY_EXAMPLE.productivityLevel)
    }
  }

  const result = calculateObjectPoints(components, reuse, prodLevel)

  const updateCount = (id: string, count: number) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, count } : c))
  }

  const updateComplexity = (id: string, complexity: OPComplexity) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, complexity } : c))
  }

  const reuseOk = reuse >= 10 && reuse <= 30
  const prodOk = result.prod >= 7 && result.prod <= 25
  const overallStatus: 'accept' | 'warn' = reuseOk && prodOk ? 'accept' : 'warn'

  const message = `Object Point Count: ${result.objectPointCount}. NOP after ${reuse}% reuse: ${result.nop.toFixed(1)}. At PROD = ${result.prod} (${prodLevel}), estimated effort = ${result.effort.toFixed(3)} P/M.${reuseOk && prodOk ? ' Both reuse and productivity sit within the faculty\'s nominal guidance.' : ' Review reuse % or productivity level against faculty guidance (reuse 10–30%, PROD 7–25).'}`

  const grouped: Record<OPType, OPComponent[]> = { Screen: [], Report: [], '3GL': [] }
  components.forEach(c => grouped[c.type].push(c))

  return (
    <MetricPageLayout
      title="Object Points / COCOMO II"
      module="Module 3 — Software Effort Estimation"
      description="Early-stage effort estimation using visible UI/application objects (Screens, Reports, 3GL Components), explicitly accounting for code reuse and team capability."
      formulaSection={
        <FormulaCard
          formulas={[
            'Object Point Count = Σ (Instances × Complexity Weight)',
            'NOP = Object Point Count × (100 − %reuse) / 100',
            'Effort = NOP / PROD  [Person-Months]',
          ]}
          variables={[
            { symbol: 'OPC', name: 'Object Point Count', description: 'Weighted sum of all Screens, Reports, and 3GL components' },
            { symbol: '%reuse', name: 'Reuse Percentage', description: 'Percentage of existing objects/components reused' },
            { symbol: 'NOP', name: 'New Object Points', description: 'Adjusted count after accounting for reuse' },
            { symbol: 'PROD', name: 'Productivity Rate', description: 'Rate based on developer experience & capability' },
          ]}
        />
      }
      variableDictionary={
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-3)' }}>Complexity Weights</p>
            <table className="text-xs w-full">
              <thead><tr style={{ color: 'var(--text-3)' }}>{['Type', 'Simple', 'Medium', 'Difficult'].map(h => <th key={h} className="text-left pb-1 pr-4">{h}</th>)}</tr></thead>
              <tbody>
                {TYPES.map(t => (
                  <tr key={t} style={{ color: 'var(--text-2)' }}>
                    <td className="pr-4 font-mono font-semibold" style={{ color: 'var(--text-1)' }}>{t}</td>
                    {COMPLEXITIES.map(c => {
                      const w = OP_WEIGHTS[t][c]
                      return (
                        <td key={c} className="pr-4 font-mono" style={{ color: w === null ? 'var(--s-warn)' : undefined }}>
                          {w === null ? 'N/S†' : w}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr><td colSpan={4} className="pt-2 text-xs" style={{ color: 'var(--text-3)' }}>† Not specified in faculty PDF — only 3GL Difficult = 10 is given</td></tr>
              </tfoot>
            </table>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-3)' }}>Productivity Rates (PROD)</p>
            <div className="flex gap-3 flex-wrap text-xs">
              {PROD_LEVELS.map(l => <span key={l} style={{ color: 'var(--text-2)' }}>{l}: <span className="font-mono" style={{ color: 'var(--text-1)' }}>{PROD_RATES[l]}</span></span>)}
            </div>
          </div>
        </div>
      }
      necessity={
        <div className="space-y-2 text-sm" style={{ color: 'var(--text-2)' }}>
          <p>Object Point estimation provides early-stage effort and schedule estimation at the application composition level using visible UI/application objects while explicitly rewarding code reuse (%reuse) and factoring in team capability (PROD).</p>
          <p className="font-semibold mt-3" style={{ color: 'var(--text-1)' }}>Faculty Nominal Guidance:</p>
          <ul className="list-disc list-inside">
            <li>%reuse ≥ 10% to 30%</li>
            <li>PROD ≥ 7 to 25</li>
          </ul>
          <p className="mt-2 text-xs" style={{ color: 'var(--text-3)' }}>Faculty Example: OPC = (4×2)+(2×8) = 24, NOP = 24×90/100 = 21.6, Effort = 21.6/7 ≈ 3.086 P/M</p>
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
          </div>

          {TYPES.map(type => (
            <div key={type}>
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-3)' }}>{type}s</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b" style={{ color: 'var(--text-3)', borderColor: 'var(--border)' }}>
                      {['Description', 'Complexity', 'Weight', 'Count', 'Points'].map(h => <th key={h} className="text-left pb-1.5 pr-3">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {grouped[type].map(c => {
                      const w = OP_WEIGHTS[type][c.complexity]
                      const specified = isWeightSpecified(c.type, c.complexity)
                      const isUnspecifiedWithCount = !specified && c.count > 0
                      return (
                        <tr key={c.id} className="border-b" style={{ borderColor: 'var(--border)', color: isUnspecifiedWithCount ? 'var(--s-warn)' : 'var(--text-2)' }}>
                          <td className="py-1 pr-3">{c.label}</td>
                          <td className="py-1 pr-3">
                            <select value={c.complexity} onChange={e => updateComplexity(c.id, e.target.value as OPComplexity)}
                              className="rounded-lg px-2 py-0.5 text-xs outline-none"
                              style={{ background: 'var(--ctrl-bg)', border: '1px solid var(--ctrl-border)', color: 'var(--text-1)' }}>
                              {COMPLEXITIES.map(x => <option key={x} value={x}>{x}</option>)}
                            </select>
                          </td>
                          <td className="py-1 pr-3 font-mono" style={{ color: specified ? 'var(--text-1)' : 'var(--s-warn)' }}>
                            {specified ? w : 'N/S†'}
                          </td>
                          <td className="py-1 pr-3">
                            <input type="number" value={c.count} min={0}
                              onChange={e => updateCount(c.id, parseInt(e.target.value) || 0)}
                              className="w-12 rounded-lg px-2 py-0.5 text-xs font-mono outline-none"
                              style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', color: 'var(--text-1)' }} />
                          </td>
                          <td className="py-1 font-mono font-bold" style={{ color: 'var(--text-1)' }}>
                            {specified ? (w as number) * c.count : <span style={{ color: 'var(--s-warn)' }}>0†</span>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {result.hasUnspecifiedWeights && (
            <div className="p-3 rounded-xl text-xs" style={{ color: 'var(--s-warn)', background: 'var(--s-warn-bg)', border: '1px solid var(--s-warn-border)' }}>
              † <strong>Note:</strong> The faculty PDF specifies only <strong>Difficult = 10</strong> for 3GL components. Simple and Medium 3GL weights are not given in the faculty notes. Rows marked N/S use weight = 0 as a placeholder — these rows contribute 0 object points. Use Difficult complexity for 3GL components when following the faculty specification.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs block mb-2" style={{ color: 'var(--text-3)' }}>
                Reuse Percentage: <span className="font-mono font-bold" style={{ color: reuseOk ? 'var(--s-pass)' : 'var(--s-warn)' }}>{reuse}%</span>
              </label>
              <input type="range" min={0} max={100} step={5} value={reuse}
                onChange={e => setReuse(parseInt(e.target.value))} className="w-full" />
              <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-3)' }}><span>0%</span><span>50%</span><span>100%</span></div>
            </div>
            <div>
              <label className="text-xs block mb-2" style={{ color: 'var(--text-3)' }}>Developer Productivity (PROD)</label>
              <select value={prodLevel} onChange={e => setProdLevel(e.target.value as ProductivityLevel)}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: 'var(--ctrl-bg)', border: '1px solid var(--ctrl-border)', color: 'var(--text-1)' }}>
                {PROD_LEVELS.map(l => <option key={l} value={l}>{l} (PROD = {PROD_RATES[l]})</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            {[
              { label: 'Object Point Count', value: result.objectPointCount },
              { label: 'NOP (after reuse)', value: result.nop },
              { label: 'PROD Rate', value: result.prod },
              { label: 'Effort (P/M)', value: result.effort },
            ].map(item => (
              <div key={item.label} className="text-center p-4 rounded-xl" style={{ background: 'var(--surface-raised)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--text-3)' }}>{item.label}</p>
                <AnimatedNumber
                  value={item.value}
                  decimals={item.label === 'Effort (P/M)' ? 3 : item.label === 'NOP (after reuse)' ? 1 : 0}
                  className="text-xl font-bold"
                  style={{ color: 'var(--text-1)' } as React.CSSProperties}
                />
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl font-mono text-xs" style={{ color: 'var(--code-text)', background: 'var(--code-bg)', border: '1px solid var(--code-border)' }}>
            OPC = {result.objectPointCount} | NOP = {result.objectPointCount} × (100 − {reuse}) / 100 = {result.nop.toFixed(1)} | Effort = {result.nop.toFixed(1)} / {result.prod} = {result.effort.toFixed(3)} P/M
          </div>
        </div>
      }
      nominalRange={
        <NominalRangeGauge
          value={result.effort}
          min={0}
          max={50}
          label="Effort"
          unit="P/M"
          status={overallStatus}
          statusLabel={overallStatus === 'accept' ? 'NOMINAL' : 'REVIEW INPUTS'}
          message={message}
        />
      }
    />
  )
}
