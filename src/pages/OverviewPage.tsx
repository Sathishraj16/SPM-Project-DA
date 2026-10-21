import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Target, Clock, DollarSign, Shield, Users, Zap, FileText, Settings, ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react'
import GlassCard from '../components/GlassCard'

const OBJECTIVES = [
  { icon: Clock,       label: 'Deliver on Time',             desc: 'Meet the scheduled milestones for EventHub releases' },
  { icon: DollarSign,  label: 'Within Budget',               desc: 'Control cloud infrastructure and development costs' },
  { icon: FileText,    label: 'SRS / ERS Documentation',     desc: 'Document requirements to avoid future problems' },
  { icon: CheckCircle, label: 'Meet Customer Requirements',  desc: 'Ensure EventHub features match organizer & attendee needs' },
  { icon: Shield,      label: 'Software Product Quality',    desc: 'Deliver reliable, performant ticketing and event management' },
  { icon: Zap,         label: 'Manage Risk Effectively',     desc: 'Identify and mitigate payment, security, and schedule risks' },
  { icon: Users,       label: 'Optimize Resource Utilization', desc: 'Efficiently allocate dev team across EventHub modules' },
  { icon: Target,      label: 'Minimize Defects',            desc: 'Rigorous QA for checkout flows and payment processing' },
  { icon: Settings,    label: 'Maintainability',             desc: 'Modular architecture for ongoing feature additions' },
  { icon: CheckCircle, label: 'Compliance',                  desc: 'Payment security (PCI-DSS), data privacy, accessibility' },
]

const SMART = [
  { letter: 'S', word: 'Specific',    desc: 'Clear and well-defined objectives — exactly what EventHub must achieve, with no ambiguity in scope or deliverables.' },
  { letter: 'M', word: 'Measurable',  desc: 'Success can be quantified — uptime %, ticket throughput, test coverage, and user satisfaction scores.' },
  { letter: 'A', word: 'Achievable',  desc: "Realistic given the team's expertise, available tooling, and the project's 5-year lifecycle budget." },
  { letter: 'R', word: 'Realistic',   desc: 'Satisfies user requirements within the constraints of scope, time, and cost without scope creep.' },
  { letter: 'T', word: 'Time-bound',  desc: 'Time-specific milestones with a defined delivery date and sprint schedule to maintain accountability.' },
]

const STEPS = [
  { step: 0, title: 'Select Project',                    output: 'Project Scope Structure',            desc: 'Clearly identify the project scope and objective. Define goal, identify schedule, determine project scope, specify constraints & assumptions.' },
  { step: 1, title: 'Identify Project Infrastructure',   output: 'Project Infrastructure Plan',        desc: 'Identify the environment & organizing structure needed. Select developing methodology, identify hardware & software, define reporting structure, decide communication channel.' },
  { step: 2, title: 'Analyze Project Characteristics',   output: 'Characteristic Analysis Report',     desc: 'Identify unique features of the project, management techniques, and perform characteristic analysis. Input: Project scope. Output: Complexity, technical requirement, project waste.' },
  { step: 3, title: 'Identify Project Products & Activities', output: 'PBS & WBS',                     desc: 'Identification of deliverables and goals of project. Create PBS (Product Breakdown Structure) and WBS (Work Breakdown Structure). List product deliverables and define every project activity.' },
  { step: 4, title: 'Estimate Effort for Each Activity', output: 'Effort Estimation Report',           desc: 'Estimate the amount of work required to complete each project activity. Use estimation models such as PERT and COCOMO II Object Point method.' },
  { step: 5, title: 'Identify Activity Risk',            output: 'Risk Mitigation Plan & Risk Register', desc: 'Analyze positive risks, identify technical risks, financial risks, operational risks, schedule risks, and prepare a mitigation plan for the EventHub project.' },
  { step: 6, title: 'Allocate Resources',                output: 'Resource Allocation Plan',           desc: 'Map each and every resource to the project — hardware & software, humans, developers, project manager resources. Ensure no resource bottlenecks.' },
  { step: 7, title: 'Review Plan',                       output: 'Approved Project Management Plan',   desc: 'Review the plan and get validation from stakeholders. Verify all estimates. Output: Approved project management plan.' },
  { step: 8, title: 'Publish Plan',                      output: 'Published Plan',                     desc: 'Formally publish the approved project management plan and distribute to all team members and stakeholders.' },
  { step: 9, title: 'Execute Plan',                      output: 'Project in Execution',               desc: 'Begin executing the plan. Monitor progress against baseline, track milestones, and report status to stakeholders.' },
]

const CONTRACT_TYPES = [
  { name: 'Fixed Price',       desc: 'Total price is fixed regardless of actual costs. EventHub pays a set amount for defined deliverables.' },
  { name: 'Cost Reimbursable', desc: 'Contractor is reimbursed for actual costs plus a fee. Used when project scope is uncertain.' },
  { name: 'Time & Material',   desc: 'Payment based on time spent and materials used. Flexible for evolving requirements.' },
  { name: 'Unit Price',        desc: 'Payment per unit of deliverable. Suitable for repetitive, measurable work items.' },
]

const ACCEPTANCE_TYPES = [
  { name: 'Provisional',  desc: 'Tentative acceptance pending final verification and testing.' },
  { name: 'Partial',      desc: 'Acceptance of a portion of deliverables while work continues on others.' },
  { name: 'Final',        desc: 'Complete and unconditional acceptance of all deliverables.' },
  { name: 'Conditional',  desc: 'Acceptance subject to specified conditions being met within a defined timeframe.' },
]

const CONTROL_CYCLE  = ['Plan', 'Monitor', 'Identify Deviation', 'Take Corrective Action', 'Re-evaluate / Re-plan']
const CHANGE_CONTROL = ['Change Request', 'Record Change', 'Impact Analysis', 'Review Changes', 'Approve / Reject', 'Update Baseline', 'Verification & Implementation']

export default function OverviewPage() {
  const [activeStep,      setActiveStep]      = useState(0)
  const [activeSmart,     setActiveSmart]     = useState<number | null>(null)
  const [activeSpmVertex, setActiveSpmVertex] = useState<string | null>(null)

  const spmVertices = [
    { id: 'scope', label: 'Scope', x: 50, y: 10, desc: 'What must be delivered — features, requirements, and boundaries of the EventHub system.' },
    { id: 'time',  label: 'Time',  x: 10, y: 90, desc: 'When it must be delivered — sprint schedule, milestones, and the final release deadline.' },
    { id: 'cost',  label: 'Cost',  x: 90, y: 90, desc: 'What it costs to deliver — development, infrastructure, licensing, and operational expenses.' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -8, filter: 'blur(2px)' }}
      transition={{ duration: 0.2 }}
      className="space-y-8"
    >
      {/* Hero */}
      <div className="text-center pt-8 pb-2">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-1)' }}>EventHub // SPM Studio</h1>
        <p className="text-base max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-2)' }}>
          "The process of planning, organising, monitoring, controlling and Managing to deliver quality product with scope, time, cost."
        </p>
        <p className="text-sm mt-2" style={{ color: 'var(--s-warn)' }}>
          ⚠ Schedule Slippage: "If the project is failed to deliver within the estimated time than it becomes waste."
        </p>
      </div>

      {/* SPM Triangle + SMART */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Triangle */}
        <GlassCard title="SPM Triangle — Scope, Time, Cost">
          <div className="relative flex justify-center">
            <svg viewBox="0 0 200 180" className="w-44 h-44">
              <polygon points="100,15 20,165 180,165"
                fill="none" stroke="var(--border-strong)" strokeWidth="1.5" />
              {spmVertices.map(v => (
                <g key={v.id} onClick={() => setActiveSpmVertex(activeSpmVertex === v.id ? null : v.id)}
                  style={{ cursor: 'pointer' }}>
                  <circle
                    cx={v.x * 2} cy={v.y * 1.8}
                    r={activeSpmVertex === v.id ? 14 : 10}
                    fill={activeSpmVertex === v.id ? 'var(--surface-raised)' : 'var(--surface-raised)'}
                    stroke={activeSpmVertex === v.id ? 'var(--border-strong)' : 'var(--border)'}
                    strokeWidth="2"
                    style={{ transition: 'all 0.2s' }}
                  />
                  <text x={v.x * 2} y={v.y * 1.8 + (v.y > 50 ? 24 : -18)}
                    textAnchor="middle"
                    fill={activeSpmVertex === v.id ? 'var(--text-1)' : 'var(--text-3)'}
                    fontSize="9" fontWeight="600">{v.label}</text>
                </g>
              ))}
            </svg>
          </div>
          <AnimatePresence>
            {activeSpmVertex && (
              <motion.div
                key={activeSpmVertex}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-3 rounded-lg text-sm"
                style={{ background: 'var(--surface-raised)', color: 'var(--text-2)' }}
              >
                <span className="font-semibold" style={{ color: 'var(--text-1)' }}>
                  {spmVertices.find(v => v.id === activeSpmVertex)?.label}:{' '}
                </span>
                {spmVertices.find(v => v.id === activeSpmVertex)?.desc}
              </motion.div>
            )}
          </AnimatePresence>
          {!activeSpmVertex && (
            <p className="text-xs text-center mt-2" style={{ color: 'var(--text-3)' }}>Click a vertex to learn more</p>
          )}
        </GlassCard>

        {/* SMART */}
        <GlassCard title="SMART Objectives for EventHub">
          <div className="grid grid-cols-5 gap-2 mb-4">
            {SMART.map((s, i) => (
              <motion.button
                key={s.letter}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveSmart(activeSmart === i ? null : i)}
                className="flex flex-col items-center gap-1 p-2 rounded-lg transition-all"
                style={{
                  background: activeSmart === i ? 'var(--surface-raised)' : 'var(--ctrl-bg)',
                  border: `1px solid ${activeSmart === i ? 'var(--border-strong)' : 'var(--border)'}`,
                }}
              >
                <span className="text-xl font-black" style={{ color: 'var(--text-1)' }}>{s.letter}</span>
                <span className="text-xs font-medium" style={{ color: 'var(--text-3)' }}>{s.word}</span>
              </motion.button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            {activeSmart !== null && (
              <motion.div
                key={activeSmart}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3 rounded-lg text-sm"
                style={{ background: 'var(--surface-raised)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
              >
                <span className="font-semibold" style={{ color: 'var(--text-1)' }}>
                  {SMART[activeSmart].word}:{' '}
                </span>
                {SMART[activeSmart].desc}
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>

      {/* Core Objectives */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>
          EventHub Core Objectives
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {OBJECTIVES.map((obj, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-xl p-4 text-center space-y-2"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <obj.icon size={18} className="mx-auto" style={{ color: 'var(--text-3)' }} />
              <p className="text-xs font-semibold" style={{ color: 'var(--text-1)' }}>{obj.label}</p>
              <p className="text-xs leading-tight" style={{ color: 'var(--text-3)' }}>{obj.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stepwise Project Planning */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>
          Stepwise Project Planning (Steps 0–9)
        </p>
        <div className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          {/* Step buttons */}
          <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
            {STEPS.map(s => (
              <button
                key={s.step}
                onClick={() => setActiveStep(s.step)}
                className="shrink-0 w-8 h-8 rounded-full text-xs font-bold transition-all"
                style={{
                  background: activeStep === s.step ? 'var(--surface-raised)' : 'var(--ctrl-bg)',
                  color: activeStep === s.step ? 'var(--text-1)' : 'var(--text-3)',
                  border: `1px solid ${activeStep === s.step ? 'var(--border-strong)' : 'var(--border)'}`,
                }}
              >
                {s.step}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl font-black" style={{ color: 'var(--border-strong)' }}>
                  {activeStep}
                </span>
                <div>
                  <h3 className="text-base font-bold" style={{ color: 'var(--text-1)' }}>
                    {STEPS[activeStep].title}
                  </h3>
                  <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--text-2)' }}>
                    {STEPS[activeStep].desc}
                  </p>
                  <div
                    className="mt-3 inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full"
                    style={{ background: 'var(--s-pass-bg)', color: 'var(--s-pass)', border: '1px solid var(--s-pass-border)' }}
                  >
                    <ArrowRight size={11} />
                    Output: {STEPS[activeStep].output}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30"
              style={{ background: 'var(--ctrl-bg)', border: '1px solid var(--ctrl-border)', color: 'var(--text-1)' }}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              onClick={() => setActiveStep(Math.min(9, activeStep + 1))}
              disabled={activeStep === 9}
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30"
              style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-strong)', color: 'var(--text-1)' }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Strategic vs Technical */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <GlassCard title="Strategic Assessment">
          <p className="text-sm mb-3" style={{ color: 'var(--text-2)' }}>
            Process of evaluating whether a software project supports the organization's long-term business objectives.
          </p>
          <ul className="space-y-2">
            {['Ensure project alignment with business goals', 'Evaluate business value and ROI', 'Prioritize projects based on need', 'Support investment decisions'].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-2)' }}>
                <span style={{ color: 'var(--text-3)' }}>›</span> {item}
              </li>
            ))}
          </ul>
        </GlassCard>
        <GlassCard title="Technical Assessment">
          <p className="text-sm mb-3" style={{ color: 'var(--text-2)' }}>
            Evaluation of technical feasibility to determine whether the project can be delivered using existing or new technologies.
          </p>
          <ul className="space-y-2">
            {['Dev team expertise & capability', 'System architecture suitability', 'Performance, security & scalability', 'Integration with existing systems'].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-2)' }}>
                <span style={{ color: 'var(--text-3)' }}>›</span> {item}
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      {/* Control cycle / Change control */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <GlassCard title="Project Control Cycle">
          <div className="flex flex-wrap gap-2 items-center">
            {CONTROL_CYCLE.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="text-xs px-2.5 py-1 rounded-full"
                  style={{
                    background: 'var(--surface-raised)',
                    color: 'var(--text-2)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {step}
                </span>
                {i < CONTROL_CYCLE.length - 1 && (
                  <ArrowRight size={11} style={{ color: 'var(--border-strong)' }} />
                )}
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard title="Change Control Process">
          <div className="flex flex-wrap gap-2 items-center">
            {CHANGE_CONTROL.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="text-xs px-2 py-1 rounded-full"
                  style={{
                    background: 'var(--ctrl-bg)',
                    color: 'var(--text-2)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {step}
                </span>
                {i < CHANGE_CONTROL.length - 1 && (
                  <ArrowRight size={10} style={{ color: 'var(--border-strong)' }} />
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Under / Over Estimation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-xl p-5" style={{ background: 'var(--s-warn-bg)', border: '1px solid var(--s-warn-border)' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--s-warn)' }}>Under Estimation</p>
          <p className="text-xs mb-3" style={{ color: 'var(--text-2)' }}>Heuristic value ≤ actual cost — admissible heuristic, guaranteed optimal path but causes:</p>
          <ul className="space-y-1">
            {['Schedule overrun', 'Cost overrun', 'Poor software quality', 'Increased team stress', 'Scope reduction'].map((e, i) => (
              <li key={i} className="text-xs" style={{ color: 'var(--s-warn)' }}>• {e}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl p-5" style={{ background: 'var(--s-fail-bg)', border: '1px solid var(--s-fail-border)' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--s-fail)' }}>Over Estimation</p>
          <p className="text-xs mb-3" style={{ color: 'var(--text-2)' }}>Heuristic value &gt; cost — not admissible, may miss optimal; causes:</p>
          <ul className="space-y-1">
            {['Increased project cost', 'Loss of business opportunity', 'Poor resource allocation', 'Schedule padding', 'Reduced profitability'].map((e, i) => (
              <li key={i} className="text-xs" style={{ color: 'var(--s-fail)' }}>• {e}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Contracts & Acceptance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <GlassCard title="Contract Types">
          <div className="space-y-2">
            {CONTRACT_TYPES.map((c, i) => (
              <div key={i} className="p-3 rounded-lg" style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{c.name}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard title="Types of Acceptance">
          <div className="space-y-2">
            {ACCEPTANCE_TYPES.map((a, i) => (
              <div key={i} className="p-3 rounded-lg" style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{a.name}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{a.desc}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  )
}
