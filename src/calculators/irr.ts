import { calculateNPV, type NPVInputs } from './npv'

export interface IRRResult {
  r1: number
  r2: number
  npv1: number
  npv2: number
  irr: number
  requiredRate: number
  accepted: boolean
}

export function calculateIRR(
  baseInputs: NPVInputs,
  r1: number,
  r2: number,
): IRRResult {
  const npv1 = calculateNPV({ ...baseInputs, discountRate: r1 }).npv
  const npv2 = calculateNPV({ ...baseInputs, discountRate: r2 }).npv
  const irr = r1 + (npv1 / (npv1 - npv2)) * (r2 - r1)

  return { r1, r2, npv1, npv2, irr, requiredRate: r1, accepted: irr > r1 }
}

export const IRR_FACULTY_PROJECTS = [
  { name: 'Project A', investment: 200000, flows: [40000, 40000, 40000, 50000, 150000], r1: 10, r2: 15 },
  { name: 'Project B', investment: 500000, flows: [100000, 100000, 100000, 150000, 200000], r1: 5, r2: 10 },
  { name: 'Project C', investment: 300000, flows: [60000, 60000, 60000, 70000, 100000], r1: 3, r2: 7 },
]
