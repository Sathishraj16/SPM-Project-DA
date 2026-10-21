import { useState, useCallback } from 'react'
import MetricPageLayout from '../components/MetricPageLayout'
import FormulaCard from '../components/FormulaCard'
import InputField from '../components/InputField'
import AnimatedNumber from '../components/AnimatedNumber'
import NominalRangeGauge from '../components/NominalRangeGauge'
import PresetToggle from '../components/PresetToggle'
import { calculateCBA, CBA_FACULTY_EXAMPLE, CBA_EVENTHUB_PRESET } from '../calculators/cba'
import type { CBAInputs } from '../calculators/cba'

export default function CBAPage({ onResult }: { onResult?: (r: ReturnType<typeof calculateCBA>) => void }) {
  const [preset,  setPreset]  = useState<0 | 1>(0)
  const [inputs,  setInputs]  = useState<CBAInputs>(CBA_EVENTHUB_PRESET)
  const [focused, setFocused] = useState<string | null>(null)

  const result = calculateCBA(inputs)

  const handlePreset = (idx: 0 | 1) => {
    setPreset(idx)
    setInputs(idx === 0 ? CBA_EVENTHUB_PRESET : CBA_FACULTY_EXAMPLE)
  }

  const set = useCallback((key: keyof CBAInputs) => (v: number) => {
    setInputs(prev => {
      const next = { ...prev, [key]: v }
      onResult?.(calculateCBA(next))
      return next
    })
  }, [onResult])

  const status      = result.netBenefits > 0 ? 'accept' : result.netBenefits === 0 ? 'warn' : 'reject'
  const statusLabel = result.netBenefits > 0 ? 'ACCEPT' : result.netBenefits === 0 ? 'BREAK-EVEN' : 'REJECT'
  const message     = result.netBenefits > 0
    ? `ACCEPT PROJECT: The EventHub investment is economically worthwhile as Total Benefits exceed Total Cost, generating a positive Net Benefit of ₹${result.netBenefits.toLocaleString()} and supporting long-term ROI.`
    : result.netBenefits === 0
    ? 'BREAK-EVEN: Total Benefits equal Total Cost exactly. No net gain or loss.'
    : "REJECT / RECONSIDER: Anticipated benefits do not cover EventHub's development and operational costs. Re-evaluate cloud infrastructure costs or scope before proceeding."

  return (
    <MetricPageLayout
      title="Cost-Benefit Analysis (CBA) & Net Benefit"
      module="Module 2 — Project Activity Planning"
      description="Financial evaluation technique to compare expected cost against anticipated benefits and determine whether the project is economically worthwhile."
      formulaSection={
        <FormulaCard
          formulas={[
            'Total Cost = PC + IC + (AOC × n)',
            'Total Benefits = AB × n',
            'Total Benefits with SV = Total Benefits + SV',
            'Net Benefits = Total Benefits with SV − Total Cost',
          ]}
          highlightedVar={focused ?? undefined}
          variables={[
            { symbol: 'PC',  name: 'Purchase Cost',        description: 'Initial acquisition/development cost (s/w development, testing, design, H/W, s/w license)' },
            { symbol: 'IC',  name: 'Installation Cost',    description: 'Initial setup, deployment, and infrastructure configuration cost' },
            { symbol: 'AOC', name: 'Annual Operating Cost',description: 'Recurring yearly operational cost (maintenance, support, cloud, user and staff training)' },
            { symbol: 'AB',  name: 'Annual Benefit',       description: 'Yearly monetary value from productivity, operational cost reduction, customer satisfaction, and increased revenue' },
            { symbol: 'n',   name: 'Life of Project',      description: 'Operational lifespan in years' },
            { symbol: 'SV',  name: 'Salvage Value',        description: "Residual value recovered at the end of the project's life" },
          ]}
        />
      }
      variableDictionary={
        <ul className="space-y-3">
          {[
            ['Purchase Cost',         'Initial acquisition/development cost including software development, testing, design, hardware, and licenses.'],
            ['Installation Cost',     'Initial setup, deployment, and infrastructure configuration cost for the EventHub platform.'],
            ['Annual Operating Cost', 'Recurring yearly costs: maintenance, cloud hosting, support, and staff training.'],
            ['Annual Benefit',        'Yearly monetary value from increased revenue, productivity gains, and cost reductions.'],
            ['Life of Project',       'Operational lifespan of the system in years.'],
            ['Salvage / Discount Value', 'Residual value recovered at end-of-life (hardware, software licenses, etc.).'],
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
          <p>CBA is a financial evaluation technique used in SPM to compare the expected cost of a project with its anticipated benefits and determine whether the project is economically worthwhile.</p>
          <p className="font-semibold mt-2" style={{ color: 'var(--text-1)' }}>Objectives:</p>
          <ul className="list-disc list-inside space-y-1">
            {['Evaluate project feasibility', 'Justify project investment', 'Compare alternate solutions', 'Ensure efficient resource utilization', 'Support informed decision making', 'Help prioritize projects', 'Identify financial risk early'].map(o => <li key={o}>{o}</li>)}
          </ul>
        </div>
      }
      calculator={
        <div className="rounded-xl p-6 space-y-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h4 className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Calculator Inputs</h4>
            <PresetToggle
              options={[{ label: 'EventHub Preset' }, { label: 'Faculty Example' }]}
              selected={preset}
              onChange={handlePreset}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <InputField label="Purchase Cost"          value={inputs.purchaseCost}          onChange={set('purchaseCost')}          min={0}  prefix="₹"   onFocus={() => setFocused('PC')}  onBlur={() => setFocused(null)} />
            <InputField label="Installation Cost"      value={inputs.installationCost}      onChange={set('installationCost')}      min={0}  prefix="₹"   onFocus={() => setFocused('IC')}  onBlur={() => setFocused(null)} />
            <InputField label="Annual Operating Cost"  value={inputs.annualOperatingCost}   onChange={set('annualOperatingCost')}   min={0}  prefix="₹"   onFocus={() => setFocused('AOC')} onBlur={() => setFocused(null)} />
            <InputField label="Annual Benefit"         value={inputs.annualBenefit}         onChange={set('annualBenefit')}         min={0}  prefix="₹"   onFocus={() => setFocused('AB')}  onBlur={() => setFocused(null)} />
            <InputField label="Life of Project (years)"value={inputs.lifeOfProject}         onChange={set('lifeOfProject')}         min={1}  max={50} step={1} suffix="yrs" onFocus={() => setFocused('n')} onBlur={() => setFocused(null)} />
            <InputField label="Salvage Value"          value={inputs.salvageValue}          onChange={set('salvageValue')}          min={0}  prefix="₹"   onFocus={() => setFocused('SV')}  onBlur={() => setFocused(null)} />
          </div>
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t"
            style={{ borderColor: 'var(--border)' }}
          >
            {[
              { label: 'Total Cost',         value: result.totalCost,               color: 'var(--s-fail)' },
              { label: 'Total Benefits',     value: result.totalBenefits,           color: 'var(--text-1)' },
              { label: 'Benefits + Salvage', value: result.totalBenefitsWithSalvage,color: 'var(--text-1)' },
              { label: 'Net Benefits',       value: result.netBenefits,             color: result.netBenefits >= 0 ? 'var(--s-pass)' : 'var(--s-fail)' },
            ].map(item => (
              <div key={item.label} className="text-center p-4 rounded-lg" style={{ background: 'var(--surface-raised)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--text-3)' }}>{item.label}</p>
                <AnimatedNumber
                  value={item.value}
                  prefix="₹"
                  className="text-lg font-bold"
                  style={{ color: item.color } as React.CSSProperties}
                />
              </div>
            ))}
          </div>
        </div>
      }
      nominalRange={
        <NominalRangeGauge
          value={result.netBenefits}
          min={-Math.abs(result.totalCost)}
          max={result.totalBenefitsWithSalvage}
          label="Net Benefits"
          unit="₹"
          status={status}
          statusLabel={statusLabel}
          message={message}
        />
      }
    />
  )
}
