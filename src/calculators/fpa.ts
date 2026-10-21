export type FPComplexity = 'Low' | 'Average' | 'High'

export interface FunctionComponent {
  id: string
  type: 'EI' | 'EO' | 'EQ' | 'ILF' | 'EIF'
  label: string
  count: number
  complexity: FPComplexity
}

export interface GSCRating {
  id: number
  name: string
  rating: number
}

export interface FPAResult {
  ufp: number
  tdi: number
  vaf: number
  fp: number
  componentBreakdown: { type: string; weight: number; count: number; contribution: number }[]
}

const WEIGHTS: Record<string, Record<FPComplexity, number>> = {
  EI:  { Low: 3, Average: 4, High: 6 },
  EO:  { Low: 4, Average: 5, High: 7 },
  EQ:  { Low: 3, Average: 4, High: 6 },
  ILF: { Low: 7, Average: 10, High: 15 },
  EIF: { Low: 5, Average: 7, High: 10 },
}

export function calculateFPA(
  components: FunctionComponent[],
  gscRatings: GSCRating[],
): FPAResult {
  const componentBreakdown = components.map(c => {
    const weight = WEIGHTS[c.type][c.complexity]
    return { type: `${c.type} (${c.complexity})`, weight, count: c.count, contribution: weight * c.count }
  })

  const ufp = componentBreakdown.reduce((s, c) => s + c.contribution, 0)
  const tdi = gscRatings.reduce((s, g) => s + g.rating, 0)
  const vaf = 0.65 + 0.01 * tdi
  const fp = ufp * vaf

  return { ufp, tdi, vaf, fp, componentBreakdown }
}

export const FPA_DEFAULT_GSCS: GSCRating[] = [
  { id: 1, name: 'Data communications', rating: 4 },
  { id: 2, name: 'Distributed data processing', rating: 2 },
  { id: 3, name: 'Performance', rating: 3 },
  { id: 4, name: 'Heavily used configuration', rating: 2 },
  { id: 5, name: 'Transaction rate', rating: 4 },
  { id: 6, name: 'Online data entry', rating: 5 },
  { id: 7, name: 'End-user efficiency', rating: 4 },
  { id: 8, name: 'Online update', rating: 3 },
  { id: 9, name: 'Complex processing', rating: 3 },
  { id: 10, name: 'Reusability', rating: 2 },
  { id: 11, name: 'Installation ease', rating: 2 },
  { id: 12, name: 'Operational ease', rating: 3 },
  { id: 13, name: 'Multiple sites', rating: 2 },
  { id: 14, name: 'Facilitate change', rating: 3 },
]

export const FPA_EVENTHUB_COMPONENTS: FunctionComponent[] = [
  { id: '1', type: 'EI', label: 'User Registration / Login', count: 2, complexity: 'Average' },
  { id: '2', type: 'EI', label: 'Event Creation / Booking', count: 3, complexity: 'High' },
  { id: '3', type: 'EO', label: 'Event Listing & Search', count: 2, complexity: 'Average' },
  { id: '4', type: 'EO', label: 'Attendance Analytics Report', count: 2, complexity: 'High' },
  { id: '5', type: 'EQ', label: 'Event Detail Inquiry', count: 3, complexity: 'Average' },
  { id: '6', type: 'ILF', label: 'User / Event Database', count: 2, complexity: 'Average' },
  { id: '7', type: 'ILF', label: 'Ticketing & Payment DB', count: 1, complexity: 'High' },
  { id: '8', type: 'EIF', label: 'Payment Gateway Integration', count: 1, complexity: 'High' },
  { id: '9', type: 'EIF', label: 'Email / Notification Service', count: 1, complexity: 'Average' },
]
