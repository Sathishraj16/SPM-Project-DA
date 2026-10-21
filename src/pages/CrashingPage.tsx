import { useState } from 'react'
import MetricPageLayout from '../components/MetricPageLayout'
import FormulaCard from '../components/FormulaCard'
import AnimatedNumber from '../components/AnimatedNumber'
import PresetToggle from '../components/PresetToggle'
import { calculateCostSlope, CRASHING_FACULTY_EXAMPLE, CRASHING_EVENTHUB_PRESET } from '../calculators/crashing'
import type { CrashActivity } from '../calculators/crashing'

const STEPS = [
  'Draw the project network and identify all activities.',
  'Identify the critical path and its total duration.',
  'Determine crash cost and crash time for each critical activity.',
  'Compare cost slopes; select critical activity with the lowest cost slope.',
  'Reduce that activity\'s duration by one unit (within crash limit).',
  'Recalculate the critical path — a new path may emerge.',
  'Repeat until desired duration is achieved or further crashing is not economical.',
]

let nextId = 10
export default function CrashingPage() {
  const [preset, setPreset] = useState<0 | 1>(0)
  const [activities, setActivities] = useState<CrashActivity[]>(CRASHING_FACULTY_EXAMPLE)

  const handlePreset = (idx: 0 | 1) => {
    setPreset(idx)
    setActivities(idx === 0 ? CRASHING_FACULTY_EXAMPLE : CRASHING_EVENTHUB_PRESET)
  }

  const results = activities.map(calculateCostSlope)
  const criticalBySlope = [...results].sort((a, b) => a.costSlope - b.costSlope)

  const update = (id: string, field: keyof CrashActivity, value: number | string) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a))
  }

  const addActivity = () => {
    setActivities(prev => [...prev, { id: String(nextId++), label: 'Activity', normalTime: 6, crashTime: 4, normalCost: 1000, crashCost: 1600 }])
  }

  const removeActivity = (id: string) => setActivities(prev => prev.filter(a => a.id !== id))

  return (
    <MetricPageLayout
      title="Project Crashing & Cost Slope"
      module="Module 2 — Shortening Project Duration"
      description="Process of reducing project completion time by adding resources to critical activities, evaluated using Cost Slope — the additional cost per unit of time saved."
      formulaSection={
        <FormulaCard
          formulas={['Cost Slope = (Crash Cost − Normal Cost) / (Normal Time − Crash Time)']}
          variables={[
            { symbol: 'NT', name: 'Normal Time', description: 'Standard estimated duration of the activity' },
            { symbol: 'CT', name: 'Crash Time', description: 'Minimum possible duration after adding resources' },
            { symbol: 'NC', name: 'Normal Cost', description: 'Baseline cost of executing the activity in Normal Time' },
            { symbol: 'CC', name: 'Crash Cost', description: 'Elevated cost incurred when shortening to Crash Time' },
          ]}
        />
      }
      variableDictionary={
        <ul className="space-y-2 text-sm">
          {[
            ['Normal Time', 'Standard estimated duration of the activity without any acceleration.'],
            ['Crash Time', 'Minimum possible duration achievable by adding human resources.'],
            ['Normal Cost', 'Baseline cost of executing the activity in its normal time.'],
            ['Crash Cost', 'Elevated cost incurred when shortening the activity to crash time.'],
            ['Cost Slope', 'Additional cost per unit of time saved by crashing the activity.'],
            ['Max Crash', 'Maximum time reduction allowed = Normal Time − Crash Time.'],
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
          <p>Project crashing reduces completion time to meet customer and management deadlines, avoid delay penalties, and get a deviating project back on track.</p>
          <p className="font-semibold mt-3" style={{ color: 'var(--text-1)' }}>Faculty 7-Step Crashing Algorithm:</p>
          <ol className="space-y-1">
            {STEPS.map((step, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-bold shrink-0" style={{ color: 'var(--text-2)' }}>{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
          <p className="text-sm mt-3" style={{ color: 'var(--s-warn)' }}>Key Rule: Only crash critical path activities. Crashing a non-critical activity does not reduce project duration.</p>
        </div>
      }
      calculator={
        <div className="rounded-xl p-6 space-y-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <PresetToggle
              options={[{ label: 'Faculty Example' }, { label: 'EventHub Preset' }]}
              selected={preset}
              onChange={handlePreset}
            />
            <button onClick={addActivity} className="text-xs px-3 py-2 rounded-xl"
              style={{ background: 'var(--ctrl-bg)', color: 'var(--text-2)', border: '1px solid var(--ctrl-border)' }}>
              + Activity
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs border-b" style={{ color: 'var(--text-3)', borderColor: 'var(--border)' }}>
                  {['Activity', 'Normal Time', 'Crash Time', 'Normal Cost (₹)', 'Crash Cost (₹)', 'Max Crash', 'Cost Slope', ''].map(h => (
                    <th key={h} className="text-left pb-3 pr-4 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((a, i) => {
                  const isLowest = i === 0 && a.costSlope === criticalBySlope[0].costSlope
                  const isInvalid = a.normalTime <= a.crashTime || a.crashCost < a.normalCost
                  return (
                    <tr key={a.id} className="border-b" style={{ borderColor: 'var(--border)', color: isLowest ? 'var(--s-pass)' : 'var(--text-2)' }}>
                      <td className="py-2 pr-4">
                        <input value={a.label} onChange={e => update(a.id, 'label', e.target.value)}
                          className="w-24 bg-transparent outline-none text-sm border-b"
                          style={{ borderColor: 'var(--border)', color: 'inherit' }} />
                      </td>
                      {(['normalTime', 'crashTime', 'normalCost', 'crashCost'] as const).map(field => (
                        <td key={field} className="py-2 pr-4">
                          <input type="number" value={a[field]} min={0}
                            onChange={e => update(a.id, field, Number(e.target.value) || 0)}
                            className="w-20 rounded-lg px-2 py-1 text-xs font-mono outline-none"
                            style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', color: 'var(--text-1)' }} />
                        </td>
                      ))}
                      <td className="py-2 pr-4 font-mono">{a.maxCrash}</td>
                      <td className="py-2 pr-4">
                        {isInvalid
                          ? <span className="text-xs" style={{ color: 'var(--s-fail)' }}>Invalid (check times/costs)</span>
                          : <AnimatedNumber value={a.costSlope} decimals={2} suffix="/unit" className="font-mono font-bold" style={{ color: a.costSlope === criticalBySlope[0].costSlope ? 'var(--s-pass)' : 'inherit' } as React.CSSProperties} />
                        }
                      </td>
                      <td className="py-2">
                        <button onClick={() => removeActivity(a.id)} className="text-lg transition-colors" style={{ color: 'var(--text-3)' }}>×</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {criticalBySlope.length > 0 && (
            <div className="p-4 rounded-xl text-sm" style={{ background: 'var(--s-pass-bg)', border: '1px solid var(--s-pass-border)' }}>
              <span className="font-semibold" style={{ color: 'var(--s-pass)' }}>Crash Priority: </span>
              <span style={{ color: 'var(--text-1)' }}>{criticalBySlope[0].label} (Cost Slope: {criticalBySlope[0].costSlope.toFixed(2)}/unit)</span>
              <span style={{ color: 'var(--text-3)' }}> — lowest cost slope, crash this first.</span>
            </div>
          )}
        </div>
      }
      nominalRange={
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {results.map(a => (
            <div key={a.id} className="rounded-xl p-4 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-3)' }}>{a.label}</p>
              <p className="text-lg font-black font-mono" style={{ color: 'var(--text-1)' }}>{a.costSlope.toFixed(0)}</p>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>per unit saved</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>Max: {a.maxCrash} units</p>
            </div>
          ))}
        </div>
      }
    />
  )
}
