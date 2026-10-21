export type MetricStatus = 'accept' | 'reject' | 'caution' | 'info'

export interface MetricSummary {
  id: number
  name: string
  status: MetricStatus
  value: string
  interpretation: string
}

export interface AllMetricsState {
  cba?: { netBenefits: number; accepted: boolean; totalCost: number; totalBenefitsWithSalvage: number }
  cashflow?: { closingCashBalance: number; healthy: boolean }
  payback?: { paybackPeriod: number; roi: number; name: string }
  npv?: { npv: number; accepted: boolean; pvOfBenefits: number }
  bcr?: { bcr: number; status: string }
  irr?: { irr: number; accepted: boolean; requiredRate: number }
  risk?: { totalRisks: number; highRisks: number; avgExposure: number }
  cpm?: { projectDuration: number; criticalPaths: string[][] }
  crashing?: { activities: { id: string; costSlope: number }[] }
  pert?: { totalExpectedTime: number; totalVariance: number; totalStdDev: number }
  fpa?: { fp: number; vaf: number; ufp: number }
  objectPoints?: { effort: number; nop: number; objectPointCount: number }
}
