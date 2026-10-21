import { useState } from 'react'
import MetricPageLayout from '../components/MetricPageLayout'
import FormulaCard from '../components/FormulaCard'
import AnimatedNumber from '../components/AnimatedNumber'
import PresetToggle from '../components/PresetToggle'
import { calculatePayback, PAYBACK_FACULTY_EXAMPLES, PAYBACK_EVENTHUB_PRESET } from '../calculators/paybackRoi'
import type { PaybackProject } from '../calculators/paybackRoi'

function ProjectCard({ project, onUpdate }: { project: PaybackProject; onUpdate: (p: PaybackProject) => void }) {
  const result = calculatePayback(project)
  const roiStatus   = result.roi > 30 ? 'var(--s-pass)' : result.roi > 15 ? 'var(--s-warn)' : 'var(--s-fail)'
  const paybackStatus = result.paybackPeriod < project.cashInflows.length ? 'var(--s-pass)' : 'var(--s-fail)'

  let cumulative = 0
  const cumulativeTable = project.cashInflows.map((inflow, i) => {
    cumulative += inflow
    const recovered = Math.min(cumulative, project.investment)
    return { year: i + 1, inflow, cumulative, recovered, done: cumulative >= project.investment }
  })

  return (
    <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between">
        <input
          className="text-sm font-bold bg-transparent outline-none pb-0.5"
          style={{ color: 'var(--text-1)', borderBottom: '1px solid var(--border)' }}
          value={project.name}
          onChange={e => onUpdate({ ...project, name: e.target.value })}
        />
        <div className="flex gap-4 text-xs">
          <span className="font-mono font-semibold" style={{ color: paybackStatus }}>PB: {result.paybackPeriod.toFixed(2)} yrs</span>
          <span className="font-mono font-semibold" style={{ color: roiStatus }}>ROI: {result.roi.toFixed(2)}%</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs" style={{ color: 'var(--text-3)' }}>Investment (₹)</label>
          <input
            type="number"
            value={project.investment}
            min={0}
            onChange={e => onUpdate({ ...project, investment: Number(e.target.value) || 0 })}
            className="w-full mt-1 rounded-lg px-3 py-1.5 text-sm font-mono outline-none"
            style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
          />
        </div>
        <div>
          <label className="text-xs" style={{ color: 'var(--text-3)' }}>Net Profit</label>
          <p className="text-sm font-mono font-bold mt-1" style={{ color: result.netProfit >= 0 ? 'var(--s-pass)' : 'var(--s-fail)' }}>
            ₹{result.netProfit.toLocaleString()}
          </p>
        </div>
      </div>

      <div>
        <label className="text-xs block mb-2" style={{ color: 'var(--text-3)' }}>Annual Cash Inflows (₹)</label>
        <div className="flex flex-wrap gap-2">
          {project.cashInflows.map((v, i) => (
            <div key={i} className="flex flex-col gap-0.5">
              <span className="text-xs text-center" style={{ color: 'var(--text-3)' }}>Yr {i + 1}</span>
              <input
                type="number"
                value={v}
                min={0}
                onChange={e => {
                  const next = [...project.cashInflows]
                  next[i] = Number(e.target.value) || 0
                  onUpdate({ ...project, cashInflows: next })
                }}
                className="w-20 rounded-lg px-2 py-1.5 text-xs font-mono outline-none text-center"
                style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
              />
            </div>
          ))}
          <button
            onClick={() => onUpdate({ ...project, cashInflows: [...project.cashInflows, 0] })}
            className="self-end text-xs px-2 py-1.5 rounded-lg"
            style={{ background: 'var(--ctrl-bg)', color: 'var(--text-2)', border: '1px solid var(--ctrl-border)' }}
          >+ Year</button>
          {project.cashInflows.length > 1 && (
            <button
              onClick={() => onUpdate({ ...project, cashInflows: project.cashInflows.slice(0, -1) })}
              className="self-end text-xs px-2 py-1.5 rounded-lg"
              style={{ background: 'var(--s-fail-bg)', color: 'var(--s-fail)', border: '1px solid var(--s-fail-border)' }}
            >−</button>
          )}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-3)' }}>Cumulative Recovery</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ color: 'var(--text-3)' }}>
                {['Year', 'Inflow', 'Cumulative', 'Status'].map(h => (
                  <th key={h} className="text-left py-1 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cumulativeTable.map(row => (
                <tr key={row.year} style={{ color: row.done ? 'var(--s-pass)' : 'var(--text-2)' }}>
                  <td className="py-1 pr-4 font-mono">{row.year}</td>
                  <td className="py-1 pr-4 font-mono">₹{row.inflow.toLocaleString()}</td>
                  <td className="py-1 pr-4 font-mono">₹{row.cumulative.toLocaleString()}</td>
                  <td className="py-1">{row.done ? '✓ Recovered' : `₹${(project.investment - row.cumulative).toLocaleString()} remaining`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className="grid grid-cols-2 gap-4 pt-3 border-t"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="text-center">
          <p className="text-xs" style={{ color: 'var(--text-3)' }}>Payback Period</p>
          <AnimatedNumber value={result.paybackPeriod} decimals={2} suffix=" yrs" className="text-xl font-bold" style={{ color: paybackStatus } as React.CSSProperties} />
        </div>
        <div className="text-center">
          <p className="text-xs" style={{ color: 'var(--text-3)' }}>ROI</p>
          <AnimatedNumber value={result.roi} decimals={2} suffix="%" className="text-xl font-bold" style={{ color: roiStatus } as React.CSSProperties} />
        </div>
      </div>
    </div>
  )
}

export default function PaybackROIPage() {
  const [preset, setPreset] = useState<0 | 1>(0)
  const [projects, setProjects] = useState<PaybackProject[]>(PAYBACK_EVENTHUB_PRESET)

  const handlePreset = (idx: 0 | 1) => {
    setPreset(idx)
    setProjects(idx === 0 ? PAYBACK_EVENTHUB_PRESET : PAYBACK_FACULTY_EXAMPLES)
  }

  const updateProject = (i: number, p: PaybackProject) => {
    setProjects(prev => prev.map((x, j) => j === i ? p : x))
  }

  const addProject = () => {
    setProjects(prev => [...prev, { name: `Project ${String.fromCharCode(65 + prev.length)}`, investment: 100000, cashInflows: [25000, 25000, 25000, 25000] }])
  }

  return (
    <MetricPageLayout
      title="Payback Period & Return on Investment (ROI)"
      module="Module 2 — Cost Benefit Evaluation Techniques"
      description="Determines how long to recover the initial investment and measures percentage profitability relative to investment cost."
      formulaSection={
        <FormulaCard
          formulas={[
            'Payback (Uniform) = Initial Investment / Annual Cash Inflow',
            'Payback (Uneven) = Years before recovery + (Remaining / Next Year Inflow)',
            'ROI = (Net Profit / Investment Cost) × 100',
            'Net Profit = Total Inflows − Investment Cost',
          ]}
        />
      }
      variableDictionary={
        <ul className="space-y-3">
          {[
            ['Initial Investment',  'Total upfront capital outflow at Year 0.'],
            ['Annual Cash Inflow',  'Yearly monetary benefit recovered by the project.'],
            ['Net Profit',          'Total Cash Inflow minus Investment Cost.'],
            ['Payback Period',      'Time required to fully recover the initial investment.'],
            ['ROI',                 'Return on Investment — percentage profitability relative to investment cost.'],
          ].map(([name, desc]) => (
            <li key={name} className="text-sm">
              <span className="font-semibold" style={{ color: 'var(--text-1)' }}>{name}: </span>
              <span style={{ color: 'var(--text-2)' }}>{desc}</span>
            </li>
          ))}
        </ul>
      }
      necessity={
        <div className="space-y-2 text-sm" style={{ color: 'var(--text-2)' }}>
          <p>Used to compare total cost of the project without financial loss except the benefits, analyze whether the project is financially worth, determine recovery time (Payback Period), and measure percentage profitability relative to investment cost (ROI) to compare alternative projects.</p>
          <p className="font-semibold mt-2" style={{ color: 'var(--text-1)' }}>Nominal Ranges (Faculty):</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Payback Period: Shorter is better; must be strictly &lt; project lifecycle</li>
            <li>ROI &gt; 15% is acceptable</li>
            <li>ROI &gt; 30% to 60% indicates high-value project selection</li>
          </ul>
        </div>
      }
      calculator={
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <PresetToggle
              options={[{ label: 'EventHub Preset' }, { label: 'Faculty Examples' }]}
              selected={preset}
              onChange={handlePreset}
            />
            <button
              onClick={addProject}
              className="text-xs px-3 py-2 rounded-lg"
              style={{ background: 'var(--ctrl-bg)', color: 'var(--text-2)', border: '1px solid var(--ctrl-border)' }}
            >
              + Add Project
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((p, i) => (
              <ProjectCard key={i} project={p} onUpdate={(up) => updateProject(i, up)} />
            ))}
          </div>
        </div>
      }
      nominalRange={
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.map((p, i) => {
            const r = calculatePayback(p)
            const n = p.cashInflows.length
            const payOk    = r.paybackPeriod < n
            const roiLevel = r.roi > 30 ? 'var(--s-pass)' : r.roi > 15 ? 'var(--s-warn)' : 'var(--s-fail)'
            const roiLabel = r.roi > 30 ? 'HIGH VALUE' : r.roi > 15 ? 'ACCEPTABLE' : 'LOW ROI'
            return (
              <div key={i} className="rounded-xl p-4 space-y-2" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{p.name}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-2)' }}>Payback</span>
                  <span className="text-sm font-mono font-bold" style={{ color: payOk ? 'var(--s-pass)' : 'var(--s-fail)' }}>
                    {r.paybackPeriod.toFixed(2)} yrs {payOk ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-2)' }}>ROI</span>
                  <span className="text-sm font-mono font-bold" style={{ color: roiLevel }}>
                    {r.roi.toFixed(2)}% — {roiLabel}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      }
    />
  )
}
