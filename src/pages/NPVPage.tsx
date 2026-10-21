import { useState } from 'react'
import MetricPageLayout from '../components/MetricPageLayout'
import FormulaCard from '../components/FormulaCard'
import InputField from '../components/InputField'
import AnimatedNumber from '../components/AnimatedNumber'
import NominalRangeGauge from '../components/NominalRangeGauge'
import PresetToggle from '../components/PresetToggle'
import { calculateNPV, NPV_FACULTY_EXAMPLE, NPV_EVENTHUB_PRESET } from '../calculators/npv'
import type { NPVInputs } from '../calculators/npv'

export default function NPVPage() {
  const [preset, setPreset] = useState<0 | 1>(0)
  const [inputs, setInputs] = useState<NPVInputs>(NPV_EVENTHUB_PRESET)
  const [useRoundedFactors, setUseRoundedFactors] = useState(false)

  const result = calculateNPV(inputs, useRoundedFactors)

  const handlePreset = (idx: 0 | 1) => {
    setPreset(idx)
    setInputs(idx === 0 ? NPV_EVENTHUB_PRESET : NPV_FACULTY_EXAMPLE)
    setUseRoundedFactors(idx === 1)
  }

  const updateFlow = (i: number, cashFlow: number) => {
    setInputs(prev => {
      const flows = [...prev.yearlyFlows]
      flows[i] = { ...flows[i], cashFlow }
      return { ...prev, yearlyFlows: flows }
    })
  }

  const addYear = () => {
    setInputs(prev => ({
      ...prev,
      yearlyFlows: [...prev.yearlyFlows, { year: prev.yearlyFlows.length + 1, cashFlow: 0 }],
    }))
  }

  const removeYear = () => {
    setInputs(prev => ({
      ...prev,
      yearlyFlows: prev.yearlyFlows.slice(0, -1).map((f, i) => ({ ...f, year: i + 1 })),
    }))
  }

  const status = result.npv > 0 ? 'accept' : 'reject'
  const statusLabel = result.npv > 0 ? 'ACCEPT' : 'REJECT'
  const message = result.npv > 0
    ? `POSITIVE NPV (₹${result.npv.toLocaleString('en-US', { maximumFractionDigits: 0 })}): EventHub generates value above the required discount rate (${inputs.discountRate}%). A positive NPV justifies project selection.`
    : `NEGATIVE NPV (₹${result.npv.toLocaleString('en-US', { maximumFractionDigits: 0 })}): Discounted future benefits fall short of the initial investment cost at the given discount rate. Reject or restructure project costs.`

  return (
    <MetricPageLayout
      title="Net Present Value (NPV) & Discount Factor"
      module="Module 2 — Cost Benefit Evaluation Techniques"
      description="Evaluates project worth by accounting for the time value of money using discount factors, ensuring future cash inflows are accurately weighed against upfront investment cost."
      formulaSection={
        <FormulaCard
          formulas={[
            'Discount Factor = 1 / (1 + r)^t',
            'PV of Benefit = Cash Flow × Discount Factor',
            'NPV = PV of Benefits − PV of Cost',
          ]}
          variables={[
            { symbol: 'r', name: 'Discount Rate', description: 'Interest rate expressed as a decimal (e.g., 10% = 0.10)' },
            { symbol: 't', name: 'Time Period', description: 'Year number (e.g., Year 1, Year 2, …)' },
          ]}
        />
      }
      variableDictionary={
        <ul className="space-y-3">
          {[
            ['Discount Rate (r)', 'Required rate of return, expressed as % — converts to decimal for calculation.'],
            ['Time Period (t)', 'The year number for which cash flow and discount factor are computed.'],
            ['PV of Benefits', 'Sum of all discounted future cash inflows across all years.'],
            ['PV of Cost', 'Initial investment (undiscounted, as it occurs at Year 0).'],
            ['NPV', 'Net difference between present value of benefits and costs.'],
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
          <p>NPV evaluates project worth by accounting for the time value of money using discount factors, ensuring that future cash inflows are accurately weighed against upfront investment cost before selecting a project.</p>
          <p className="mt-3 font-semibold" style={{ color: 'var(--text-1)' }}>Decision Rules:</p>
          <ul className="list-disc list-inside">
            <li>NPV {'>'} 0: Accept the project</li>
            <li>NPV ≤ 0: Reject the project</li>
          </ul>
        </div>
      }
      calculator={
        <div className="rounded-xl p-6 space-y-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h4 className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Calculator</h4>
            <div className="flex items-center gap-3 flex-wrap">
              <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                <button
                  role="switch"
                  aria-checked={useRoundedFactors}
                  onClick={() => setUseRoundedFactors(v => !v)}
                  className="relative w-9 h-5 rounded-full transition-colors"
                  style={{ background: useRoundedFactors ? 'var(--active-bg)' : 'var(--ctrl-bg)', border: `1px solid ${useRoundedFactors ? 'var(--active-border)' : 'var(--ctrl-border)'}` }}
                >
                  <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                    style={{ transform: useRoundedFactors ? 'translateX(16px)' : 'translateX(0)' }} />
                </button>
                <span style={{ color: useRoundedFactors ? 'var(--text-1)' : 'var(--text-3)' }}>
                  Faculty 4-decimal rounding
                </span>
              </label>
              <PresetToggle
                options={[{ label: 'EventHub Preset' }, { label: 'Faculty Example' }]}
                selected={preset}
                onChange={handlePreset}
              />
            </div>
          </div>
          {useRoundedFactors && (
            <div className="px-3 py-2 rounded-xl text-xs" style={{ color: 'var(--text-2)', background: 'var(--surface-raised)', border: '1px solid var(--border)' }}>
              Faculty rounding mode: discount factors rounded to 4 decimal places (e.g. 0.9091, 0.8264…), matching the faculty's worked-example table. This reproduces the exact faculty NPV values. Default mode uses full IEEE 754 precision.
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Discount Rate (%)" value={inputs.discountRate} onChange={v => setInputs(p => ({ ...p, discountRate: v }))} min={0.1} max={100} step={0.5} suffix="%" />
            <InputField label="Initial Investment (₹)" value={inputs.initialInvestment} onChange={v => setInputs(p => ({ ...p, initialInvestment: v }))} min={0} prefix="₹" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Yearly Cash Flows</p>
              <div className="flex gap-2">
                <button onClick={addYear} className="text-xs px-2 py-1 rounded-lg" style={{ background: 'var(--ctrl-bg)', color: 'var(--text-2)', border: '1px solid var(--ctrl-border)' }}>+ Year</button>
                {inputs.yearlyFlows.length > 1 && <button onClick={removeYear} className="text-xs px-2 py-1 rounded-lg" style={{ background: 'var(--s-fail-bg)', color: 'var(--s-fail)', border: '1px solid var(--s-fail-border)' }}>−</button>}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs" style={{ color: 'var(--text-3)' }}>
                    {['Year', 'Cash Flow (₹)', 'Discount Factor', 'Present Value (₹)'].map(h => <th key={h} className="text-left pb-2 pr-4">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {result.yearResults.map((yr, i) => (
                    <tr key={yr.year} className="border-t" style={{ borderColor: 'var(--border)' }}>
                      <td className="py-2 pr-4 font-mono" style={{ color: 'var(--text-2)' }}>{yr.year}</td>
                      <td className="py-2 pr-4">
                        <input type="number" value={inputs.yearlyFlows[i].cashFlow}
                          onChange={e => updateFlow(i, Number(e.target.value) || 0)}
                          className="w-28 rounded-lg px-2 py-1 text-xs font-mono outline-none"
                          style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                        />
                      </td>
                      <td className="py-2 pr-4 font-mono" style={{ color: 'var(--text-2)' }}>{yr.discountFactor.toFixed(4)}</td>
                      <td className="py-2 font-mono" style={{ color: 'var(--text-1)' }}>₹{yr.presentValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                    </tr>
                  ))}
                  <tr className="border-t font-semibold" style={{ borderColor: 'var(--border-strong)' }}>
                    <td colSpan={2} className="py-2" style={{ color: 'var(--text-3)' }}>Totals</td>
                    <td className="py-2 font-mono" style={{ color: 'var(--text-3)' }}>—</td>
                    <td className="py-2 font-mono" style={{ color: 'var(--text-1)' }}>₹{result.pvOfBenefits.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            {[
              { label: 'PV of Benefits', value: result.pvOfBenefits, color: 'var(--text-1)' },
              { label: 'PV of Cost', value: result.pvOfCost, color: 'var(--text-1)' },
              { label: 'NPV', value: result.npv, color: result.npv >= 0 ? 'var(--s-pass)' : 'var(--s-fail)' },
            ].map(item => (
              <div key={item.label} className="text-center p-4 rounded-xl" style={{ background: 'var(--surface-raised)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--text-3)' }}>{item.label}</p>
                <AnimatedNumber value={item.value} prefix="₹" decimals={0} className="text-lg font-bold" style={{ color: item.color } as React.CSSProperties} />
              </div>
            ))}
          </div>
        </div>
      }
      nominalRange={
        <NominalRangeGauge
          value={result.npv}
          min={-Math.abs(result.pvOfCost)}
          max={result.pvOfBenefits}
          label="NPV"
          unit="₹"
          status={status}
          statusLabel={statusLabel}
          message={message}
        />
      }
    />
  )
}
