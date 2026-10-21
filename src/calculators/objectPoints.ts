export type OPComplexity = 'Simple' | 'Medium' | 'Difficult'
export type OPType = 'Screen' | 'Report' | '3GL'

/** Faculty-specified complexity weights.
 *  3GL Simple and Medium are NOT provided in the faculty PDF —
 *  only Difficult=10 is given. null means "unspecified by faculty". */
const OP_WEIGHTS: Record<OPType, Record<OPComplexity, number | null>> = {
  Screen: { Simple: 1, Medium: 2, Difficult: 3 },
  Report: { Simple: 2, Medium: 5, Difficult: 8 },
  '3GL':  { Simple: null, Medium: null, Difficult: 10 },
}

export function isWeightSpecified(type: OPType, complexity: OPComplexity): boolean {
  return OP_WEIGHTS[type][complexity] !== null
}

export function getWeight(type: OPType, complexity: OPComplexity, fallback = 0): number {
  const w = OP_WEIGHTS[type][complexity]
  return w === null ? fallback : w
}

export interface OPComponent {
  id: string
  type: OPType
  label: string
  count: number
  complexity: OPComplexity
}

export type ProductivityLevel = 'Very Low' | 'Low' | 'Nominal' | 'High' | 'Very High'

const PROD_RATES: Record<ProductivityLevel, number> = {
  'Very Low': 4,
  'Low': 7,
  'Nominal': 13,
  'High': 25,
  'Very High': 50,
}

export interface OPResult {
  componentBreakdown: { type: string; weight: number; count: number; contribution: number; weightSpecified: boolean }[]
  hasUnspecifiedWeights: boolean
  objectPointCount: number
  reuse: number
  nop: number
  productivityLevel: ProductivityLevel
  prod: number
  effort: number
}

export function calculateObjectPoints(
  components: OPComponent[],
  reuse: number,
  productivityLevel: ProductivityLevel,
): OPResult {
  const componentBreakdown = components.map(c => {
    const weight = getWeight(c.type, c.complexity, 0)
    const specified = isWeightSpecified(c.type, c.complexity)
    return {
      type: `${c.type} (${c.complexity})`,
      weight,
      count: c.count,
      contribution: weight * c.count,
      weightSpecified: specified,
    }
  })

  const objectPointCount = componentBreakdown.reduce((s, c) => s + c.contribution, 0)
  const hasUnspecifiedWeights = componentBreakdown.some(c => !c.weightSpecified && c.count > 0)
  const nop = (objectPointCount * (100 - reuse)) / 100
  const prod = PROD_RATES[productivityLevel]
  const effort = nop / prod

  return { componentBreakdown, hasUnspecifiedWeights, objectPointCount, reuse, nop, productivityLevel, prod, effort }
}

export const OP_FACULTY_EXAMPLE: { components: OPComponent[]; reuse: number; productivityLevel: ProductivityLevel } = {
  components: [
    { id: '1', type: 'Screen', label: 'Application Screens', count: 4, complexity: 'Medium' },
    { id: '2', type: 'Report', label: 'Application Reports', count: 2, complexity: 'Difficult' },
  ],
  reuse: 10,
  productivityLevel: 'Low',
}

export const OP_EVENTHUB_COMPONENTS: OPComponent[] = [
  { id: '1', type: 'Screen', label: 'Event Feed', count: 1, complexity: 'Medium' },
  { id: '2', type: 'Screen', label: 'Ticketing Checkout', count: 1, complexity: 'Difficult' },
  { id: '3', type: 'Screen', label: 'Organizer Dashboard', count: 1, complexity: 'Difficult' },
  { id: '4', type: 'Screen', label: 'Auth (Login/Register)', count: 2, complexity: 'Simple' },
  { id: '5', type: 'Screen', label: 'Event Detail', count: 2, complexity: 'Medium' },
  { id: '6', type: 'Screen', label: 'User Profile', count: 1, complexity: 'Medium' },
  { id: '7', type: 'Screen', label: 'Admin Panel', count: 1, complexity: 'Difficult' },
  { id: '8', type: 'Screen', label: 'Search & Filter', count: 1, complexity: 'Medium' },
  { id: '9', type: 'Screen', label: 'Analytics Page', count: 1, complexity: 'Difficult' },
  { id: '10', type: 'Screen', label: 'Settings', count: 1, complexity: 'Simple' },
  { id: '11', type: 'Report', label: 'Attendance Analytics', count: 1, complexity: 'Difficult' },
  { id: '12', type: 'Report', label: 'Revenue Summary', count: 1, complexity: 'Difficult' },
  { id: '13', type: 'Report', label: 'Sponsor ROI Report', count: 1, complexity: 'Medium' },
  { id: '14', type: 'Report', label: 'Event Performance', count: 1, complexity: 'Medium' },
  { id: '15', type: 'Report', label: 'User Activity Report', count: 1, complexity: 'Simple' },
  { id: '16', type: 'Report', label: 'Ticket Sales Summary', count: 1, complexity: 'Medium' },
  { id: '17', type: '3GL', label: 'Payment Gateway', count: 1, complexity: 'Difficult' },
  { id: '18', type: '3GL', label: 'QR Verification', count: 1, complexity: 'Difficult' },
  { id: '19', type: '3GL', label: 'Email Notification Service', count: 1, complexity: 'Difficult' },
]
