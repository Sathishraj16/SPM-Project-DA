export interface PaybackProject {
  name: string
  investment: number
  cashInflows: number[]
}

export interface PaybackResult {
  name: string
  investment: number
  totalInflows: number
  netProfit: number
  paybackPeriod: number
  roi: number
}

export function calculatePayback(project: PaybackProject): PaybackResult {
  const { investment, cashInflows } = project
  const totalInflows = cashInflows.reduce((s, v) => s + v, 0)
  const netProfit = totalInflows - investment

  let cumulative = 0
  let paybackPeriod = cashInflows.length

  for (let i = 0; i < cashInflows.length; i++) {
    if (cumulative + cashInflows[i] >= investment) {
      const remaining = investment - cumulative
      paybackPeriod = i + remaining / cashInflows[i]
      break
    }
    cumulative += cashInflows[i]
  }

  const roi = (netProfit / investment) * 100

  return {
    name: project.name,
    investment,
    totalInflows,
    netProfit,
    paybackPeriod,
    roi,
  }
}

export const PAYBACK_FACULTY_EXAMPLES: PaybackProject[] = [
  { name: 'Project A', investment: 200000, cashInflows: [40000, 40000, 40000, 50000, 150000] },
  { name: 'Project B', investment: 500000, cashInflows: [100000, 100000, 100000, 150000, 200000] },
  { name: 'Project C', investment: 300000, cashInflows: [60000, 60000, 60000, 70000, 100000] },
]

export const PAYBACK_EVENTHUB_PRESET: PaybackProject[] = [
  { name: 'EventHub', investment: 410000, cashInflows: [80000, 120000, 160000, 200000, 240000] },
]
