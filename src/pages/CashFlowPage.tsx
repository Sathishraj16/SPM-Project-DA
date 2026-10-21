import { useState, useCallback } from 'react'
import MetricPageLayout from '../components/MetricPageLayout'
import FormulaCard from '../components/FormulaCard'
import InputField from '../components/InputField'
import AnimatedNumber from '../components/AnimatedNumber'
import NominalRangeGauge from '../components/NominalRangeGauge'
import PresetToggle from '../components/PresetToggle'
import { calculateCashFlow, CASHFLOW_FACULTY_EXAMPLE, CASHFLOW_EVENTHUB_PRESET } from '../calculators/cashflow'
import type { CashFlowInputs } from '../calculators/cashflow'

export default function CashFlowPage() {
  const [preset, setPreset] = useState<0 | 1>(0)
  const [inputs, setInputs] = useState<CashFlowInputs>(CASHFLOW_EVENTHUB_PRESET)
  const [focused, setFocused] = useState<string | null>(null)

  const result = calculateCashFlow(inputs)

  const handlePreset = (idx: 0 | 1) => {
    setPreset(idx)
    setInputs(idx === 0 ? CASHFLOW_EVENTHUB_PRESET : CASHFLOW_FACULTY_EXAMPLE)
  }

  const set = useCallback((key: keyof CashFlowInputs) => (v: number) => {
    setInputs(prev => ({ ...prev, [key]: v }))
  }, [])

  const buffer20pct = result.totalCashPayment * 0.2
  const isHealthy20 = result.closingCashBalance >= buffer20pct
  const status = result.closingCashBalance > 0 ? (isHealthy20 ? 'accept' : 'warn') : 'reject'
  const statusLabel = result.closingCashBalance > 0 ? (isHealthy20 ? 'HEALTHY' : 'LOW BUFFER') : 'SHORTAGE'
  const message = result.closingCashBalance > 0
    ? `HEALTHY LIQUIDITY: EventHub maintains a positive Closing Cash Balance of ₹${result.closingCashBalance.toLocaleString()}, ensuring timely project execution without funding shortages for developer salaries or cloud hosting.${isHealthy20 ? '' : ' Note: Balance is below the guideline of 20% of total payments (₹' + Math.round(buffer20pct).toLocaleString() + ').'}`
    : 'CASH SHORTAGE RISK: Cash Outflow exceeds Total Cash Available. Immediate project funding or client payment collection is required to prevent execution halt.'

  return (
    <MetricPageLayout
      title="Cash Flow Forecasting"
      module="Module 2 — Project Activity Planning"
      description="Process of estimating cash inflows and outflows over a specific period to ensure sufficient funds are available for project execution."
      formulaSection={
        <FormulaCard
          formulas={[
            'Net Cash Flow = Cash Inflow − Cash Outflow',
            'Total Available = Opening + Cash Sale + Credit Collection',
            'Total Payment = Purchase + Salary + Rent + Other',
            'Closing Balance = Total Available − Total Payment',
          ]}
          highlightedVar={focused ?? undefined}
        />
      }
      variableDictionary={
        <ul className="space-y-3">
          {[
            ['Opening Cash Balance', 'Starting liquidity available at the beginning of the period.'],
            ['Cash Sale', 'Direct cash received from ticket/event sales or service revenue.'],
            ['Credit Collection', 'Client payments, project funding collections, or credit sales recovered.'],
            ['Payment Purchase', 'Procurement of software licenses, hardware, or external services.'],
            ['Salary', 'Employee salary and contractor payments for the period.'],
            ['Rent', 'Office, server rack, or co-location facility rental costs.'],
            ['Other Expenses', 'Miscellaneous operational costs not covered above.'],
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
          <p>Cash Flow Forecasting is the process of estimating cash inflow and outflow of a project over a specific period to ensure sufficient funds are available.</p>
          <p className="font-semibold" style={{ color: 'var(--text-1)' }}>Objectives:</p>
          <ul className="list-disc list-inside space-y-1">
            {['Estimate future cash requirements', 'Maintain project liquidity', 'Plan budget effectively', 'Avoid cash shortages', 'Support financial planning', 'Increase financial control', 'Identify financial need early', 'Reduce financial risk', 'Ensure timely project execution'].map(o => <li key={o}>{o}</li>)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--s-pass)' }}>Cash Inflows</p>
              <InputField label="Opening Cash Balance" value={inputs.openingCashBalance} onChange={set('openingCashBalance')} min={0} prefix="₹" onFocus={() => setFocused('Opening')} onBlur={() => setFocused(null)} />
              <InputField label="Cash Sale" value={inputs.cashSale} onChange={set('cashSale')} min={0} prefix="₹" onFocus={() => setFocused('Cash Sale')} onBlur={() => setFocused(null)} />
              <InputField label="Credit Collection" value={inputs.creditCollection} onChange={set('creditCollection')} min={0} prefix="₹" onFocus={() => setFocused('Credit')} onBlur={() => setFocused(null)} />
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--s-fail)' }}>Cash Outflows</p>
              <InputField label="Payment Purchase" value={inputs.paymentPurchase} onChange={set('paymentPurchase')} min={0} prefix="₹" onFocus={() => setFocused('Purchase')} onBlur={() => setFocused(null)} />
              <InputField label="Salary" value={inputs.salary} onChange={set('salary')} min={0} prefix="₹" onFocus={() => setFocused('Salary')} onBlur={() => setFocused(null)} />
              <InputField label="Rent" value={inputs.rent} onChange={set('rent')} min={0} prefix="₹" onFocus={() => setFocused('Rent')} onBlur={() => setFocused(null)} />
              <InputField label="Other Expenses" value={inputs.otherExpenses} onChange={set('otherExpenses')} min={0} prefix="₹" onFocus={() => setFocused('Other')} onBlur={() => setFocused(null)} />
            </div>
          </div>
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t"
            style={{ borderColor: 'var(--border)' }}
          >
            {[
              { label: 'Net Cash Flow',       value: result.netCashFlow,         color: result.netCashFlow >= 0 ? 'var(--s-pass)' : 'var(--s-fail)' },
              { label: 'Total Cash Available',value: result.totalCashAvailable,  color: 'var(--text-1)' },
              { label: 'Total Cash Payment',  value: result.totalCashPayment,    color: 'var(--s-fail)' },
              { label: 'Closing Balance',     value: result.closingCashBalance,  color: result.closingCashBalance >= 0 ? 'var(--s-pass)' : 'var(--s-fail)' },
            ].map(item => (
              <div key={item.label} className="text-center p-4 rounded-lg" style={{ background: 'var(--surface-raised)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--text-3)' }}>{item.label}</p>
                <AnimatedNumber value={item.value} prefix="₹" className="text-lg font-bold" style={{ color: item.color } as React.CSSProperties} />
              </div>
            ))}
          </div>
        </div>
      }
      nominalRange={
        <NominalRangeGauge
          value={result.closingCashBalance}
          min={-result.totalCashPayment}
          max={result.totalCashAvailable}
          label="Closing Cash Balance"
          unit="₹"
          status={status}
          statusLabel={statusLabel}
          message={message}
        />
      }
    />
  )
}
