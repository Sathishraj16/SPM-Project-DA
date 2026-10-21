import { useState } from 'react'
import MetricPageLayout from '../components/MetricPageLayout'
import FormulaCard from '../components/FormulaCard'
import InputField from '../components/InputField'
import AnimatedNumber from '../components/AnimatedNumber'
import NominalRangeGauge from '../components/NominalRangeGauge'
import PresetToggle from '../components/PresetToggle'
import { calculateIRR, IRR_FACULTY_PROJECTS } from '../calculators/irr'
import { calculateNPV } from '../calculators/npv'
import type { NPVInputs } from '../calculators/npv'

const EVENTHUB_INPUTS: NPVInputs = {
  discountRate: 10,
  initialInvestment: 410000,
  yearlyFlows: [
    { year: 1, cashFlow: 80000 },
    { year: 2, cashFlow: 120000 },
    { year: 3, cashFlow: 160000 },
    { year: 4, cashFlow: 200000 },
    { year: 5, cashFlow: 240000 },
  ],
}

export default function IRRPage() {
  const [preset, setPreset] = useState<0 | 1>(0)
  const [projectIdx, setProjectIdx] = useState(0)
  const [r1, setR1] = useState(10)
  const [r2, setR2] = useState(15)
  const [baseInputs, setBaseInputs] = useState<NPVInputs>(EVENTHUB_INPUTS)

  const handlePreset = (idx: 0 | 1) => {
    setPreset(idx)
    if (idx === 1) {
      const proj = IRR_FACULTY_PROJECTS[projectIdx]
      setBaseInputs({ discountRate: proj.r1, initialInvestment: proj.investment, yearlyFlows: proj.flows.map((cf, i) => ({ year: i + 1, cashFlow: cf })) })
      setR1(proj.r1)
      setR2(proj.r2)
    } else {
      setBaseInputs(EVENTHUB_INPUTS)
      setR1(10)
      setR2(15)
    }
  }

  const handleProjectChange = (idx: number) => {
    setProjectIdx(idx)
    const proj = IRR_FACULTY_PROJECTS[idx]
    setBaseInputs({ discountRate: proj.r1, initialInvestment: proj.investment, yearlyFlows: proj.flows.map((cf, i) => ({ year: i + 1, cashFlow: cf })) })
    setR1(proj.r1)
    setR2(proj.r2)
  }

  const result = calculateIRR(baseInputs, r1, r2)
  const validBracket = result.npv1 > 0 && result.npv2 < 0

  const requiredRate = r1
  const accepted = validBracket && result.irr > requiredRate

  const status = !validBracket ? 'warn' : accepted ? 'accept' : 'reject'
  const statusLabel = !validBracket ? 'INVALID BRACKET' : accepted ? 'SUPERIOR YIELD' : 'SUB-THRESHOLD'
  const message = !validBracket
    ? `Warning: Interpolation requires NPV at r1 > 0 and NPV at r2 < 0. Currently NPV₁ = ₹${result.npv1.toLocaleString('en-US', { maximumFractionDigits: 0 })} and NPV₂ = ₹${result.npv2.toLocaleString('en-US', { maximumFractionDigits: 0 })}. Adjust trial rates to bracket NPV = 0.`
    : accepted
    ? `SUPERIOR YIELD: EventHub's IRR (${result.irr.toFixed(2)}%) is higher than the required discount rate (${requiredRate}%), confirming strong financial viability.`
    : `SUB-THRESHOLD YIELD: EventHub's IRR (${result.irr.toFixed(2)}%) falls below the required discount rate (${requiredRate}%), meaning capital cost outweighs returns.`

  return (
    <MetricPageLayout
      title="Internal Rate of Return (IRR)"
      module="Module 2 — Cost Benefit Evaluation Techniques"
      description="The discount rate at which NPV = 0. Uses linear interpolation between two trial rates to estimate the break-even yield."
      formulaSection={
        <FormulaCard
          formulas={[
            'NPV = 0  →  defines IRR',
            'IRR = r₁ + [NPV₁ / (NPV₁ − NPV₂)] × (r₂ − r₁)',
          ]}
          variables={[
            { symbol: 'r₁', name: 'Lower trial rate', description: 'Discount rate yielding positive NPV (NPV₁ > 0)' },
            { symbol: 'r₂', name: 'Higher trial rate', description: 'Discount rate yielding negative NPV (NPV₂ < 0)' },
            { symbol: 'NPV₁', name: 'NPV at r₁', description: 'Must be positive for valid interpolation' },
            { symbol: 'NPV₂', name: 'NPV at r₂', description: 'Must be negative for valid interpolation' },
          ]}
        />
      }
      variableDictionary={
        <ul className="space-y-3">
          {[
            ['r₁', 'Lower trial discount rate (%) that yields a positive NPV.'],
            ['r₂', 'Higher trial discount rate (%) that yields a negative NPV.'],
            ['NPV₁', 'Net Present Value calculated at discount rate r₁ — must be positive.'],
            ['NPV₂', 'Net Present Value calculated at discount rate r₂ — must be negative.'],
            ['IRR', 'Interpolated break-even discount rate where NPV ≈ 0.'],
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
          <p>IRR determines the exact break-even discount rate where NPV = 0, so management can verify whether the project's internal yield exceeds the organization's required discount rate.</p>
          <p className="mt-3 font-semibold" style={{ color: 'var(--text-1)' }}>Decision Rule:</p>
          <ul className="list-disc list-inside">
            <li>IRR {'>'} Required Discount Rate: Superior yield — Accept</li>
            <li>IRR ≤ Required Discount Rate: Sub-threshold — Reject</li>
          </ul>
          <p className="mt-2 text-xs" style={{ color: 'var(--s-warn)' }}>Note: The faculty's interpolation method estimates the break-even rate from two trial points. It is an approximation.</p>
        </div>
      }
      calculator={
        <div className="rounded-xl p-6 space-y-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h4 className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Calculator</h4>
            <PresetToggle
              options={[{ label: 'EventHub Preset' }, { label: 'Faculty Examples' }]}
              selected={preset}
              onChange={handlePreset}
            />
          </div>

          {preset === 1 && (
            <div className="flex gap-2 flex-wrap">
              {IRR_FACULTY_PROJECTS.map((p, i) => (
                <button key={i} onClick={() => handleProjectChange(i)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                  style={{
                    background: projectIdx === i ? 'var(--active-bg)' : 'var(--ctrl-bg)',
                    border: `1px solid ${projectIdx === i ? 'var(--active-border)' : 'var(--ctrl-border)'}`,
                    color: projectIdx === i ? 'var(--text-1)' : 'var(--text-3)',
                  }}>
                  {p.name}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Lower Trial Rate r₁ (%)" value={r1} onChange={setR1} min={0} max={99} step={1} suffix="%" />
            <InputField label="Higher Trial Rate r₂ (%)" value={r2} onChange={setR2} min={0} max={100} step={1} suffix="%" />
          </div>

          {!validBracket && (
            <div className="p-3 rounded-xl text-xs" style={{ color: 'var(--s-warn)', background: 'var(--s-warn-bg)', border: '1px solid var(--s-warn-border)' }}>
              ⚠ Invalid bracket: NPV at r₁ must be positive and NPV at r₂ must be negative for valid linear interpolation.
            </div>
          )}

          <div className="grid grid-cols-4 gap-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            {[
              { label: 'NPV at r₁', value: result.npv1, color: result.npv1 > 0 ? 'var(--s-pass)' : 'var(--s-fail)' },
              { label: 'NPV at r₂', value: result.npv2, color: result.npv2 < 0 ? 'var(--s-pass)' : 'var(--s-fail)' },
              { label: 'IRR', value: result.irr, color: 'var(--text-1)', suffix: '%' },
              { label: 'Required Rate', value: requiredRate, color: 'var(--s-warn)', suffix: '%' },
            ].map(item => (
              <div key={item.label} className="text-center p-4 rounded-xl" style={{ background: 'var(--surface-raised)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--text-3)' }}>{item.label}</p>
                <AnimatedNumber value={item.value} prefix={item.suffix ? '' : '₹'} suffix={item.suffix ?? ''} decimals={2} className="text-lg font-bold" style={{ color: item.color } as React.CSSProperties} />
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl text-xs font-mono" style={{ color: 'var(--code-text)', background: 'var(--code-bg)', border: '1px solid var(--code-border)' }}>
            IRR = {r1}% + [{result.npv1.toFixed(0)} / ({result.npv1.toFixed(0)} − ({result.npv2.toFixed(0)}))] × ({r2}% − {r1}%) = {validBracket ? result.irr.toFixed(2) : 'N/A (invalid bracket)'}%
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-3)' }}>NPV Verification</p>
            <div className="grid grid-cols-2 gap-4 text-xs">
              {[{ rate: r1, npv: result.npv1 }, { rate: r2, npv: result.npv2 }].map(({ rate }) => {
                const verification = calculateNPV({ ...baseInputs, discountRate: rate }).npv
                return (
                  <div key={rate} className="p-3 rounded-xl" style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)' }}>
                    <p style={{ color: 'var(--text-3)' }}>At r = {rate}%</p>
                    <p className="font-mono mt-1" style={{ color: 'var(--text-1)' }}>NPV = ₹{verification.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      }
      nominalRange={
        <NominalRangeGauge
          value={validBracket ? result.irr : 0}
          min={0}
          max={Math.max(r2 * 2, 30)}
          label="IRR"
          unit="%"
          status={status}
          statusLabel={statusLabel}
          message={message}
        />
      }
    />
  )
}
