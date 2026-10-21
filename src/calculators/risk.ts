export type RiskCategory = 'Technical' | 'Project' | 'Business' | 'Internal/External'
export type RiskLevel = 'Low' | 'Medium' | 'High'

export interface RiskItem {
  id: string
  description: string
  category: RiskCategory
  probability: number
  impact: number
}

export interface RiskResult extends RiskItem {
  exposure: number
  level: RiskLevel
  mitigation: string
}

export interface RiskThresholds {
  /** Exposure ≤ lowMax → Low. Exposure ≤ medMax → Medium. Else High. */
  lowMax: number
  medMax: number
}

export const DEFAULT_RISK_THRESHOLDS: RiskThresholds = { lowMax: 3, medMax: 6 }

/** Faculty provides qualitative rules only (Low/Medium/High).
 *  The numeric boundaries are user-configurable display thresholds, not faculty rules. */
export function calculateRisk(item: RiskItem, thresholds: RiskThresholds = DEFAULT_RISK_THRESHOLDS): RiskResult {
  const exposure = item.probability * item.impact

  let level: RiskLevel
  let mitigation: string
  if (exposure <= thresholds.lowMax) {
    level = 'Low'
    mitigation = 'Accept / Monitor regularly'
  } else if (exposure <= thresholds.medMax) {
    level = 'Medium'
    mitigation = 'Risk Reduction / Transfer (provide training or use cloud services)'
  } else {
    level = 'High'
    mitigation = 'Immediate Mitigation or Risk Avoidance (change plan to eliminate risk)'
  }

  return { ...item, exposure, level, mitigation }
}

export const DEFAULT_EVENTHUB_RISKS: RiskItem[] = [
  { id: '1', description: 'Security vulnerabilities in payment gateway', category: 'Technical', probability: 0.4, impact: 9 },
  { id: '2', description: 'Third-party API (ticketing) deprecation', category: 'Internal/External', probability: 0.3, impact: 7 },
  { id: '3', description: 'Schedule slippage due to team shortage', category: 'Project', probability: 0.5, impact: 6 },
  { id: '4', description: 'Budget overrun from cloud infrastructure costs', category: 'Business', probability: 0.4, impact: 5 },
  { id: '5', description: 'Data loss from insufficient backup strategy', category: 'Technical', probability: 0.2, impact: 10 },
]
