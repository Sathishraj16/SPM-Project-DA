export interface PERTActivity {
  id: string
  label: string
  optimistic: number
  mostLikely: number
  pessimistic: number
  isCritical?: boolean
}

export interface PERTActivityResult extends PERTActivity {
  expectedTime: number
  standardDeviation: number
  variance: number
}

export interface PERTResult {
  activities: PERTActivityResult[]
  totalExpectedTime: number
  totalVariance: number
  totalStdDev: number
}

export function calculatePERT(activities: PERTActivity[]): PERTResult {
  const results: PERTActivityResult[] = activities.map(a => {
    const expectedTime = (a.optimistic + 4 * a.mostLikely + a.pessimistic) / 6
    const standardDeviation = (a.pessimistic - a.optimistic) / 6
    const variance = Math.pow(standardDeviation, 2)
    return { ...a, expectedTime, standardDeviation, variance }
  })

  const criticalPath = results.filter(a => a.isCritical)
  const totalExpectedTime = criticalPath.length > 0
    ? criticalPath.reduce((s, a) => s + a.expectedTime, 0)
    : results.reduce((s, a) => s + a.expectedTime, 0)

  const totalVariance = criticalPath.length > 0
    ? criticalPath.reduce((s, a) => s + a.variance, 0)
    : results.reduce((s, a) => s + a.variance, 0)

  const totalStdDev = Math.sqrt(totalVariance)

  return { activities: results, totalExpectedTime, totalVariance, totalStdDev }
}

export const PERT_EVENTHUB_ACTIVITIES: PERTActivity[] = [
  { id: 'A', label: 'Requirements & SRS', optimistic: 2, mostLikely: 3, pessimistic: 5, isCritical: true },
  { id: 'B', label: 'UI/UX Design', optimistic: 1, mostLikely: 2, pessimistic: 4, isCritical: false },
  { id: 'C', label: 'Backend Development', optimistic: 6, mostLikely: 8, pessimistic: 12, isCritical: true },
  { id: 'D', label: 'Frontend Development', optimistic: 4, mostLikely: 6, pessimistic: 9, isCritical: false },
  { id: 'E', label: 'Payment Integration', optimistic: 2, mostLikely: 3, pessimistic: 6, isCritical: true },
  { id: 'F', label: 'Testing & QA', optimistic: 2, mostLikely: 3, pessimistic: 5, isCritical: true },
  { id: 'G', label: 'Deployment & Launch', optimistic: 1, mostLikely: 2, pessimistic: 3, isCritical: true },
]
