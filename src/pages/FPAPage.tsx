import { useState } from 'react'
import MetricPageLayout from '../components/MetricPageLayout'
import FormulaCard from '../components/FormulaCard'
import AnimatedNumber from '../components/AnimatedNumber'
import NominalRangeGauge from '../components/NominalRangeGauge'
import PresetToggle from '../components/PresetToggle'
import { calculateFPA, FPA_EVENTHUB_COMPONENTS, FPA_DEFAULT_GSCS } from '../calculators/fpa'
import type { FunctionComponent, GSCRating, FPComplexity } from '../calculators/fpa'

const WEIGHTS = {
  EI:  { Low: 3, Average: 4, High: 6 },
  EO:  { Low: 4, Average: 5, High: 7 },
  EQ:  { Low: 3, Average: 4, High: 6 },
  ILF: { Low: 7, Average: 10, High: 15 },
  EIF: { Low: 5, Average: 7, High: 10 },
}

const TYPES = ['EI', 'EO', 'EQ', 'ILF', 'EIF'] as const
const COMPLEXITIES: FPComplexity[] = ['Low', 'Average', 'High']

const FACULTY_COMPONENTS: FunctionComponent[] = [
  { id: '1', type: 'EI', label: 'User Input 1', count: 2, complexity: 'Low' },
  { id: '2', type: 'EO', label: 'Output Report 1', count: 3, complexity: 'Average' },
  { id: '3', type: 'ILF', label: 'Internal File 1', count: 1, complexity: 'Average' },
]

const FACULTY_GSCS: GSCRating[] = FPA_DEFAULT_GSCS.map(g => ({ ...g, rating: 2 }))

export default function FPAPage() {
  const [preset, setPreset] = useState<0 | 1>(0)
  const [components, setComponents] = useState<FunctionComponent[]>(FPA_EVENTHUB_COMPONENTS)
  const [gscs, setGscs] = useState<GSCRating[]>(FPA_DEFAULT_GSCS)

  const handlePreset = (idx: 0 | 1) => {
    setPreset(idx)
    if (idx === 0) {
      setComponents(FPA_EVENTHUB_COMPONENTS)
      setGscs(FPA_DEFAULT_GSCS)
    } else {
      setComponents(FACULTY_COMPONENTS)
      setGscs(FACULTY_GSCS)
    }
  }

  const result = calculateFPA(components, gscs)

  const updateCount = (id: string, count: number) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, count } : c))
  }

  const updateComplexity = (id: string, complexity: FPComplexity) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, complexity } : c))
  }

  const updateGSC = (id: number, rating: number) => {
    setGscs(prev => prev.map(g => g.id === id ? { ...g, rating } : g))
  }

  const vafStatus = result.vaf >= 0.65 && result.vaf <= 1.35 ? 'accept' : 'reject'
  const fpStatus = result.fp >= 150 && result.fp <= 400 ? 'accept' : result.fp < 150 ? 'warn' : 'warn'
  const overallStatus = vafStatus === 'accept' && fpStatus === 'accept' ? 'accept' : 'warn'
  const message = result.fp >= 150 && result.fp <= 400
    ? `EventHub FP of ${result.fp.toFixed(1)} sits within the nominal range of 150–400 FP for a medium web platform. The VAF of ${result.vaf.toFixed(3)} is within [0.65, 1.35], indicating balanced system complexity.`
    : result.fp < 150
    ? `FP of ${result.fp.toFixed(1)} is below the nominal range (150–400) for EventHub. Risk of under-estimation — could cause schedule overrun and poor software quality.`
    : `FP of ${result.fp.toFixed(1)} exceeds the nominal range (150–400). Risk of over-estimation — could cause schedule padding and loss of business opportunity.`

  return (
    <MetricPageLayout
      title="Albrecht Function Point Analysis (FPA)"
      module="Module 3 — Software Effort Estimation"
      description="Technology-independent technique introduced by Allan J. Albrecht (1979) to estimate software size, cost, and productivity from the user's functional perspective."
      formulaSection={
        <FormulaCard
          formulas={[
            'UFP = Σ (Number of functions × Weight)',
            'TDI = Σ DI_i  (14 GSCs rated 0–5, max = 70)',
            'VAF = 0.65 + 0.01 × TDI  [0.65 ≤ VAF ≤ 1.35]',
            'FP = UFP × VAF',
          ]}
        />
      }
      variableDictionary={
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2 mb-3">
            {TYPES.map(type => (
              <div key={type} className="p-2 rounded-lg" style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)' }}>
                <span className="font-mono font-bold" style={{ color: 'var(--text-1)' }}>{type}</span>
                <span className="text-xs ml-2" style={{ color: 'var(--text-3)' }}>{
                  { EI: 'External Input', EO: 'External Output', EQ: 'External Inquiry', ILF: 'Internal Logical File', EIF: 'External Interface File' }[type]
                }</span>
                <div className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>L:{WEIGHTS[type].Low} A:{WEIGHTS[type].Average} H:{WEIGHTS[type].High}</div>
              </div>
            ))}
          </div>
          <p className="text-xs" style={{ color: 'var(--text-3)' }}>GSC ratings: 0=No influence, 1=Incidental, 2=Moderate, 3=Average, 4=Significant, 5=Strong</p>
        </div>
      }
      necessity={
        <div className="space-y-2 text-sm" style={{ color: 'var(--text-2)' }}>
          <p>Introduced by Allan J. Albrecht (1979) to estimate software size, effort, cost, and productivity. Technology-independent and applicable during early development stages. Measures from the user perspective using the process: <span style={{ color: 'var(--text-1)' }}>Identify → Classify → Weight → Adjust → Calculate</span>.</p>
          <p className="font-semibold mt-3" style={{ color: 'var(--text-1)' }}>Nominal Range (Faculty):</p>
          <ul className="list-disc list-inside">
            <li>VAF must be within [0.65, 1.35]</li>
            <li>VAF ≈ 1.00 when TDI = 35 (balanced complexity)</li>
            <li>Nominal FP: 150–400 for a medium web platform like EventHub</li>
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
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>Demonstration estimate only — not an audited measurement.</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-3)' }}>Function Components</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs border-b" style={{ color: 'var(--text-3)', borderColor: 'var(--border)' }}>
                    <th className="text-left pb-2 pr-3">Type</th>
                    <th className="text-left pb-2 pr-3">Description</th>
                    <th className="text-left pb-2 pr-3">Complexity</th>
                    <th className="text-left pb-2 pr-3">Weight</th>
                    <th className="text-left pb-2 pr-3">Count</th>
                    <th className="text-left pb-2">Contribution</th>
                  </tr>
                </thead>
                <tbody>
                  {components.map(c => {
                    const w = WEIGHTS[c.type][c.complexity]
                    return (
                      <tr key={c.id} className="border-b" style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>
                        <td className="py-1.5 pr-3 font-mono font-bold" style={{ color: 'var(--text-1)' }}>{c.type}</td>
                        <td className="py-1.5 pr-3 text-xs">{c.label}</td>
                        <td className="py-1.5 pr-3">
                          <select value={c.complexity} onChange={e => updateComplexity(c.id, e.target.value as FPComplexity)}
                            className="rounded-lg px-2 py-1 text-xs outline-none"
                            style={{ background: 'var(--ctrl-bg)', border: '1px solid var(--ctrl-border)', color: 'var(--text-1)' }}>
                            {COMPLEXITIES.map(x => <option key={x} value={x}>{x}</option>)}
                          </select>
                        </td>
                        <td className="py-1.5 pr-3 font-mono" style={{ color: 'var(--text-1)' }}>{w}</td>
                        <td className="py-1.5 pr-3">
                          <input type="number" value={c.count} min={0}
                            onChange={e => updateCount(c.id, parseInt(e.target.value) || 0)}
                            className="w-14 rounded-lg px-2 py-1 text-xs font-mono outline-none"
                            style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', color: 'var(--text-1)' }} />
                        </td>
                        <td className="py-1.5 font-mono font-bold" style={{ color: 'var(--text-1)' }}>{(w * c.count).toFixed(0)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-3)' }}>14 General System Characteristics (0–5)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {gscs.map(g => (
                <div key={g.id} className="flex items-center gap-3">
                  <span className="text-xs w-48 truncate" style={{ color: 'var(--text-2)' }}>{g.id}. {g.name}</span>
                  <input type="range" min={0} max={5} step={1} value={g.rating}
                    onChange={e => updateGSC(g.id, parseInt(e.target.value))}
                    className="flex-1" />
                  <span className="text-xs font-mono w-4" style={{ color: 'var(--text-1)' }}>{g.rating}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            {[
              { label: 'UFP', value: result.ufp },
              { label: 'TDI', value: result.tdi },
              { label: 'VAF', value: result.vaf },
              { label: 'FP', value: result.fp },
            ].map(item => (
              <div key={item.label} className="text-center p-4 rounded-xl" style={{ background: 'var(--surface-raised)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--text-3)' }}>{item.label}</p>
                <AnimatedNumber
                  value={item.value}
                  decimals={item.label === 'VAF' ? 3 : 1}
                  className="text-xl font-bold"
                  style={{ color: item.label === 'FP' ? (result.fp >= 150 && result.fp <= 400 ? 'var(--s-pass)' : 'var(--s-warn)') : 'var(--text-1)' } as React.CSSProperties}
                />
              </div>
            ))}
          </div>
        </div>
      }
      nominalRange={
        <NominalRangeGauge
          value={result.fp}
          min={0}
          max={600}
          label="Function Points (FP)"
          status={overallStatus}
          statusLabel={result.fp >= 150 && result.fp <= 400 ? 'NOMINAL RANGE' : 'OUTSIDE RANGE'}
          message={message}
        />
      }
    />
  )
}
