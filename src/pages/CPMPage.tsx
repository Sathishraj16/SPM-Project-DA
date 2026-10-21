import { useState } from 'react'
import { motion } from 'framer-motion'
import MetricPageLayout from '../components/MetricPageLayout'
import FormulaCard from '../components/FormulaCard'
import PresetToggle from '../components/PresetToggle'
import { calculateCPM, CPM_FACULTY_ACTIVITIES, CPM_EVENTHUB_ACTIVITIES } from '../calculators/cpm'
import type { Activity } from '../calculators/cpm'

function AOADiagram({ activities, result }: { activities: Activity[]; result: ReturnType<typeof calculateCPM> }) {
  const nodes = Array.from(new Set(activities.flatMap(a => [a.from, a.to]))).sort((a, b) => a - b)
  const n = nodes.length
  const W = 600, H = 300
  const r = 22

  const nodePositions: Record<number, { x: number; y: number }> = {}
  const ranks: Record<number, number> = {}
  nodes.forEach(node => { ranks[node] = 0 })
  for (let pass = 0; pass < n; pass++) {
    activities.forEach(a => {
      if (ranks[a.to] <= ranks[a.from]) ranks[a.to] = ranks[a.from] + 1
    })
  }
  const maxRank = Math.max(...Object.values(ranks))
  const rankGroups: Record<number, number[]> = {}
  nodes.forEach(node => {
    const rank = ranks[node]
    if (!rankGroups[rank]) rankGroups[rank] = []
    rankGroups[rank].push(node)
  })
  Object.entries(rankGroups).forEach(([rank, group]) => {
    const rankNum = parseInt(rank)
    const x = 60 + (rankNum / (maxRank || 1)) * (W - 120)
    group.forEach((node, i) => {
      const y = 50 + (i / (group.length)) * (H - 100) + (H - 100) / (2 * group.length)
      nodePositions[node] = { x, y }
    })
  })

  const criticalSet = new Set(result.criticalPaths.flat())

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-h-72" style={{ overflow: 'visible' }}>
      <defs>
        <marker id="arrow-normal" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" style={{ fill: 'var(--border-strong)' }} />
        </marker>
        <marker id="arrow-critical" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" style={{ fill: 'var(--s-fail)' }} />
        </marker>
      </defs>

      {activities.map(a => {
        const from = nodePositions[a.from]
        const to = nodePositions[a.to]
        if (!from || !to) return null
        const isCritical = result.activities.find(x => x.id === a.id)?.isCritical
        const dx = to.x - from.x, dy = to.y - from.y
        const len = Math.sqrt(dx * dx + dy * dy)
        const nx = dx / len, ny = dy / len
        const x1 = from.x + nx * (r + 2), y1 = from.y + ny * (r + 2)
        const x2 = to.x - nx * (r + 8), y2 = to.y - ny * (r + 8)
        const midX = (x1 + x2) / 2, midY = (y1 + y2) / 2

        return (
          <g key={a.id}>
            <line x1={x1} y1={y1} x2={x2} y2={y2}
              style={{ stroke: isCritical ? 'var(--s-fail)' : 'var(--border-strong)', strokeWidth: isCritical ? 2.5 : 1.5 }}
              markerEnd={isCritical ? 'url(#arrow-critical)' : 'url(#arrow-normal)'}
            />
            <text x={midX} y={midY - 6} textAnchor="middle" fontSize="9" fontFamily="monospace"
              style={{ fill: isCritical ? 'var(--s-fail)' : 'var(--text-3)' }}>
              {a.label ?? a.id}({a.duration})
            </text>
          </g>
        )
      })}

      {nodes.map(node => {
        const pos = nodePositions[node]
        if (!pos) return null
        const isCritical = criticalSet.has(String(node))
        const E = result.nodeEarliestTimes[node]
        const L = result.nodeLatestTimes[node]
        return (
          <g key={node}>
            <circle cx={pos.x} cy={pos.y} r={r}
              style={{
                fill: isCritical ? 'var(--s-fail-bg)' : 'var(--surface-raised)',
                stroke: isCritical ? 'var(--s-fail)' : 'var(--border-strong)',
                strokeWidth: 2,
              }}
            />
            <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize="11" fontWeight="700"
              style={{ fill: 'var(--text-1)' }}>{node}</text>
            <text x={pos.x - r - 2} y={pos.y - r + 4} textAnchor="end" fontSize="8"
              style={{ fill: 'var(--text-2)' }}>{E}</text>
            <text x={pos.x + r + 2} y={pos.y - r + 4} textAnchor="start" fontSize="8"
              style={{ fill: 'var(--s-warn)' }}>{L}</text>
          </g>
        )
      })}
    </svg>
  )
}

let nextActId = 100
export default function CPMPage() {
  const [preset, setPreset] = useState<0 | 1>(0)
  const [activities, setActivities] = useState<Activity[]>(CPM_FACULTY_ACTIVITIES)

  const handlePreset = (idx: 0 | 1) => {
    setPreset(idx)
    setActivities(idx === 0 ? CPM_FACULTY_ACTIVITIES : CPM_EVENTHUB_ACTIVITIES)
  }

  const result = calculateCPM(activities)

  const updateActivity = (id: string, updates: Partial<Activity>) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a))
  }

  const addActivity = () => {
    const nodes = Array.from(new Set(activities.flatMap(a => [a.from, a.to]))).sort((a, b) => a - b)
    const last = nodes[nodes.length - 1] ?? 1
    setActivities(prev => [...prev, { id: `act-${nextActId++}`, from: last - 1, to: last, duration: 3, label: 'New' }])
  }

  const removeActivity = (id: string) => setActivities(prev => prev.filter(a => a.id !== id))

  return (
    <MetricPageLayout
      title="CPM Network & Activity Floats (AOA)"
      module="Module 2 — Network Planning Models & Activity Scheduling"
      description="Activity-on-Arrow network analysis using forward/backward passes to compute earliest/latest event times, activity floats, and identify the critical path."
      formulaSection={
        <FormulaCard
          formulas={[
            'ES = EF of predecessor | Ej = max(Ei + dij)',
            'EF = ES + d',
            'LF = LS of successor | Li = min(Lj − dij)',
            'LS = LF − d',
            'Total Float (TF) = LS − ES = LF − EF',
            'Free Float (FF) = Ej − Ei − d',
            'Interfering Float (IF) = TF − FF = Lj − Ej',
          ]}
        />
      }
      variableDictionary={
        <ul className="space-y-2 text-sm">
          {[
            ['ES', 'Earliest Start time of an activity.'],
            ['EF', 'Earliest Finish time = ES + Duration.'],
            ['LS', 'Latest Start time without delaying project completion.'],
            ['LF', 'Latest Finish time without delaying project completion.'],
            ['TF', 'Total Float — max delay without delaying project completion.'],
            ['FF', 'Free Float — delay without delaying earliest start of next activity.'],
            ['IF', 'Interfering Float — portion of float interfering with successor activities.'],
            ['Independent Float', '(Definition only) Time an activity can be delayed without affecting preceding or succeeding activities.'],
          ].map(([sym, desc]) => (
            <li key={sym}>
              <span className="font-mono font-semibold" style={{ color: 'var(--text-1)' }}>{sym}: </span>
              <span style={{ color: 'var(--text-2)' }}>{desc}</span>
            </li>
          ))}
        </ul>
      }
      necessity={
        <div className="space-y-2 text-sm" style={{ color: 'var(--text-2)' }}>
          <p>CPM (AOA) provides graphical techniques to plan, schedule, monitor &amp; control project activities, optimize resource utilization, balance time &amp; cost, and identify the Critical Path — the longest duration path where TF = 0, determining minimum project completion time.</p>
          <p className="font-semibold mt-3" style={{ color: 'var(--text-1)' }}>Faculty Rules:</p>
          <ul className="list-disc list-inside">
            <li>Critical Path activities: TF = 0, FF = 0, IF = 0 (zero tolerance for delay)</li>
            <li>Non-critical activities: TF {'>'} 0 (provides scheduling flexibility)</li>
          </ul>
        </div>
      }
      calculator={
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <PresetToggle
              options={[{ label: 'Faculty Example' }, { label: 'EventHub Preset' }]}
              selected={preset}
              onChange={handlePreset}
            />
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span style={{ color: 'var(--text-3)' }}>Duration: </span>
                <span className="font-mono font-bold" style={{ color: 'var(--text-1)' }}>{result.projectDuration} weeks</span>
              </div>
              <button onClick={addActivity} className="text-xs px-3 py-2 rounded-xl"
                style={{ background: 'var(--ctrl-bg)', color: 'var(--text-2)', border: '1px solid var(--ctrl-border)' }}>
                + Activity
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {result.criticalPaths.map((path, i) => (
              <div key={i} className="text-xs px-3 py-1.5 rounded-full"
                style={{ background: 'var(--s-fail-bg)', color: 'var(--s-fail)', border: '1px solid var(--s-fail-border)' }}>
                Critical Path {i + 1}: {path.join(' → ')}
              </div>
            ))}
          </div>

          <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex gap-4 text-xs mb-3" style={{ color: 'var(--text-3)' }}>
              <span><span className="font-mono" style={{ color: 'var(--text-2)' }}>E</span> = Earliest (top-left)</span>
              <span><span className="font-mono" style={{ color: 'var(--s-warn)' }}>L</span> = Latest (top-right)</span>
              <span><span style={{ color: 'var(--s-fail)' }}>—</span> Critical path</span>
            </div>
            <AOADiagram activities={activities} result={result} />
          </div>

          <div className="rounded-xl p-4 overflow-x-auto" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b" style={{ color: 'var(--text-3)', borderColor: 'var(--border)' }}>
                  {['Activity', 'From', 'To', 'Duration', 'ES', 'EF', 'LS', 'LF', 'TF', 'FF', 'IF', 'Critical', ''].map(h => (
                    <th key={h} className="text-left py-2 pr-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.activities.map((a) => (
                  <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="border-b"
                    style={{ borderColor: 'var(--border)', color: a.isCritical ? 'var(--s-fail)' : 'var(--text-2)' }}>
                    <td className="py-2 pr-3">
                      <input value={a.label ?? a.id} onChange={e => updateActivity(a.id, { label: e.target.value })}
                        className="w-16 bg-transparent outline-none text-xs border-b"
                        style={{ borderColor: 'var(--border)', color: 'inherit' }} />
                    </td>
                    <td className="py-2 pr-3">
                      <input type="number" value={a.from} min={1}
                        onChange={e => updateActivity(a.id, { from: parseInt(e.target.value) || 1 })}
                        className="w-10 rounded px-1 py-0.5 text-xs font-mono outline-none"
                        style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', color: 'var(--text-1)' }} />
                    </td>
                    <td className="py-2 pr-3">
                      <input type="number" value={a.to} min={1}
                        onChange={e => updateActivity(a.id, { to: parseInt(e.target.value) || 1 })}
                        className="w-10 rounded px-1 py-0.5 text-xs font-mono outline-none"
                        style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', color: 'var(--text-1)' }} />
                    </td>
                    <td className="py-2 pr-3">
                      <input type="number" value={a.duration} min={1}
                        onChange={e => updateActivity(a.id, { duration: parseInt(e.target.value) || 1 })}
                        className="w-12 rounded px-1 py-0.5 text-xs font-mono outline-none"
                        style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', color: 'var(--text-1)' }} />
                    </td>
                    {[a.es, a.ef, a.ls, a.lf, a.totalFloat, a.freeFloat, a.interferingFloat].map((v, i2) => (
                      <td key={i2} className="py-2 pr-3 font-mono">{v}</td>
                    ))}
                    <td className="py-2 pr-3">{a.isCritical ? <span className="font-bold" style={{ color: 'var(--s-fail)' }}>✓</span> : <span style={{ color: 'var(--text-3)' }}>—</span>}</td>
                    <td className="py-2">
                      <button onClick={() => removeActivity(a.id)} style={{ color: 'var(--text-3)' }} className="transition-colors">×</button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      }
      nominalRange={
        <div className="rounded-xl p-5" style={{ background: 'var(--s-fail-bg)', border: '1px solid var(--s-fail-border)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Project Duration</p>
            <span className="text-2xl font-black font-mono" style={{ color: 'var(--text-1)' }}>{result.projectDuration} weeks</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>
            {result.criticalPaths.length} critical path{result.criticalPaths.length !== 1 ? 's' : ''} identified.
            Critical activities have TF = 0 — any delay directly extends the project completion date.
            Non-critical activities have TF {'>'} 0 and can be shifted within their float for resource optimization.
          </p>
          {preset === 0 && result.projectDuration === 22 && (
            <p className="text-xs mt-3" style={{ color: 'var(--s-pass)' }}>✓ Matches faculty expected duration of 22 weeks.</p>
          )}
          {preset === 0 && result.projectDuration !== 22 && (
            <p className="text-xs mt-3" style={{ color: 'var(--s-warn)' }}>⚠ Faculty expected duration is 22 weeks. Check activity data.</p>
          )}
        </div>
      }
    />
  )
}
