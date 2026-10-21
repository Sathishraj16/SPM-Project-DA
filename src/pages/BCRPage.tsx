import { useState } from 'react'
import MetricPageLayout from '../components/MetricPageLayout'
import FormulaCard from '../components/FormulaCard'
import InputField from '../components/InputField'
import AnimatedNumber from '../components/AnimatedNumber'
import NominalRangeGauge from '../components/NominalRangeGauge'
import PresetToggle from '../components/PresetToggle'
import { calculateBCR } from '../calculators/bcr'
import { NPV_FACULTY_EXAMPLE, NPV_EVENTHUB_PRESET } from '../calculators/npv'
import type { NPVInputs } from '../calculators/npv'

export default function BCRPage() {
  const [preset, setPreset] = useState<0 | 1>(0)
  const [inputs, setInputs] = useState<NPVInputs>(NPV_EVENTHUB_PRESET)

  const result = calculateBCR(inputs)
  const bcrSafe = isFinite(result.bcr) ? result.bcr : 0

  const handlePreset = (idx: 0 | 1) => {
    setPreset(idx)
    setInputs(idx === 0 ? NPV_EVENTHUB_PRESET : NPV_FACULTY_EXAMPLE)
  }

  const status = result.status === 'accept' ? 'accept' : result.status === 'breakeven' ? 'warn' : 'reject'
  const statusLabel = result.status === 'accept' ? 'ACCEPT (BCR > 1)' : result.status === 'breakeven' ? 'BREAK-EVEN' : 'REJECT (BCR < 1)'
  const message = result.status === 'accept'
    ? `EventHub returns ₹${bcrSafe.toFixed(3)} of discounted benefit per ₹1.00 of discounted cost. Benefits exceed costs — project is economically worthwhile.`
    : result.status === 'breakeven'
    ? 'Benefits exactly equal costs at the given discount rate. Project breaks even with no net gain or loss.'
    : 'Costs exceed discounted benefits. At this discount rate, EventHub does not generate a sufficient return. Reconsider scope or discount rate.'

  const updateFlow = (i: number, cashFlow: number) => {
    setInputs(prev => {
      const flows = [...prev.yearlyFlows]
      flows[i] = { ...flows[i], cashFlow }
      return { ...prev, yearlyFlows: flows }
    })
  }

  const bcrColor = result.status === 'accept' ? 'var(--s-pass)' : result.status === 'breakeven' ? 'var(--s-warn)' : 'var(--s-fail)'
  const bcrBg = result.status === 'accept' ? 'var(--s-pass-bg)' : result.status === 'breakeven' ? 'var(--s-warn-bg)' : 'var(--s-fail-bg)'
  const bcrBorder = result.status === 'accept' ? 'var(--s-pass-border)' : result.status === 'breakeven' ? 'var(--s-warn-border)' : 'var(--s-fail-border)'

  return (
    <MetricPageLayout
      title="Benefit-Cost Ratio (BCR)"
      module="Module 2 — Cost Benefit Evaluation Techniques"
      description="Compares the Present Value of Benefits directly as a ratio against the Present Value of Cost to determine whether benefits exceed costs on a per-unit-of-cost basis."
      formulaSection={
        <FormulaCard
          formulas={[
            'BCR = Present Value of Benefits / Present Value of Cost',
            'PV of Benefits = Σ (Cash Flow × Discount Factor)',
            'Discount Factor = 1 / (1 + r)^t',
          ]}
          variables={[
            { symbol: 'PVB', name: 'Present Value of Benefits', description: 'Total discounted value of expected project inflows' },
            { symbol: 'PVC', name: 'Present Value of Cost', description: 'Total discounted value of project costs / initial investment' },
          ]}
        />
      }
      variableDictionary={
        <ul className="space-y-3">
          {[
            ['Present Value of Benefits', 'Total discounted value of all expected future project inflows, calculated using the discount factor formula.'],
            ['Present Value of Cost', 'The initial investment or total discounted outflows.'],
            ['BCR', 'Ratio showing how much benefit is received per unit of cost. A BCR of 1.134 means ₹1.134 of benefit per ₹1 invested.'],
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
          <p>BCR compares the Present Value of Benefits directly as a ratio against the Present Value of Cost to determine whether benefits exceed costs on a per-unit-of-cost basis and to prioritize projects within a portfolio.</p>
          <p className="mt-3 font-semibold" style={{ color: 'var(--text-1)' }}>Decision Rules:</p>
          <ul className="list-disc list-inside">
            <li>BCR {'>'} 1.0: Accept — benefits exceed costs</li>
            <li>BCR = 1.0: Break-even</li>
            <li>BCR {'<'} 1.0: Reject / Reconsider</li>
          </ul>
          <p className="mt-2 text-xs" style={{ color: 'var(--text-3)' }}>Faculty Example: Project A BCR = 226,757 / 200,000 = 1.134</p>
        </div>
      }
      calculator={
        <div className="rounded-xl p-6 space-y-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h4 className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Calculator</h4>
            <PresetToggle
              options={[{ label: 'EventHub Preset' }, { label: 'Faculty Example' }]}
              selected={preset}
              onChange={handlePreset}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Discount Rate (%)" value={inputs.discountRate} onChange={v => setInputs(p => ({ ...p, discountRate: v }))} min={0.1} max={100} step={0.5} suffix="%" />
            <InputField label="Initial Investment (₹)" value={inputs.initialInvestment} onChange={v => setInputs(p => ({ ...p, initialInvestment: v }))} min={1} prefix="₹" />
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Annual Cash Flows</p>
            <div className="flex flex-wrap gap-2">
              {inputs.yearlyFlows.map((f, i) => (
                <div key={f.year} className="flex flex-col gap-0.5">
                  <span className="text-xs text-center" style={{ color: 'var(--text-3)' }}>Yr {f.year}</span>
                  <input type="number" value={f.cashFlow}
                    onChange={e => updateFlow(i, Number(e.target.value) || 0)}
                    className="w-24 rounded-lg px-2 py-1.5 text-xs font-mono outline-none text-center"
                    style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="text-center p-4 rounded-xl" style={{ background: 'var(--surface-raised)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-3)' }}>PV of Benefits</p>
              <AnimatedNumber value={result.pvOfBenefits} prefix="₹" decimals={0} className="text-lg font-bold" style={{ color: 'var(--text-1)' } as React.CSSProperties} />
            </div>
            <div className="text-center p-4 rounded-xl" style={{ background: 'var(--surface-raised)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-3)' }}>PV of Cost</p>
              <AnimatedNumber value={result.pvOfCost} prefix="₹" decimals={0} className="text-lg font-bold" style={{ color: 'var(--text-1)' } as React.CSSProperties} />
            </div>
            <div className="text-center p-4 rounded-xl" style={{ background: bcrBg, border: `1px solid ${bcrBorder}` }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-3)' }}>BCR</p>
              <AnimatedNumber value={bcrSafe} decimals={3} className="text-2xl font-black" style={{ color: bcrColor } as React.CSSProperties} />
            </div>
          </div>
        </div>
      }
      nominalRange={
        <NominalRangeGauge
          value={bcrSafe}
          min={0}
          max={3}
          label="BCR"
          status={status}
          statusLabel={statusLabel}
          message={message}
        />
      }
    />
  )
}
