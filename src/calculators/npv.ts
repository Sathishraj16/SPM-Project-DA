export interface NPVYearInput {
  year: number
  cashFlow: number
}

export interface NPVInputs {
  discountRate: number
  initialInvestment: number
  yearlyFlows: NPVYearInput[]
}

export interface NPVYearResult extends NPVYearInput {
  discountFactor: number
  presentValue: number
}

export interface NPVResult {
  yearResults: NPVYearResult[]
  pvOfBenefits: number
  pvOfCost: number
  npv: number
  accepted: boolean
}

/** When useRoundedFactors=true, rounds each discount factor to 4 decimal places,
 *  matching the faculty's worked-example table (0.9091, 0.8264, 0.7513, 0.6830, 0.6209).
 *  Default is false (full IEEE 754 precision). */
export function calculateNPV(inputs: NPVInputs, useRoundedFactors = false): NPVResult {
  const r = inputs.discountRate / 100
  const yearResults: NPVYearResult[] = inputs.yearlyFlows.map(({ year, cashFlow }) => {
    const exactFactor = 1 / Math.pow(1 + r, year)
    const discountFactor = useRoundedFactors ? Math.round(exactFactor * 10000) / 10000 : exactFactor
    const presentValue = cashFlow * discountFactor
    return { year, cashFlow, discountFactor, presentValue }
  })

  const pvOfBenefits = yearResults.reduce((s, y) => s + y.presentValue, 0)
  const pvOfCost = inputs.initialInvestment
  const npv = pvOfBenefits - pvOfCost

  return { yearResults, pvOfBenefits, pvOfCost, npv, accepted: npv > 0 }
}

export const NPV_FACULTY_EXAMPLE: NPVInputs = {
  discountRate: 10,
  initialInvestment: 200000,
  yearlyFlows: [
    { year: 1, cashFlow: 40000 },
    { year: 2, cashFlow: 40000 },
    { year: 3, cashFlow: 40000 },
    { year: 4, cashFlow: 50000 },
    { year: 5, cashFlow: 150000 },
  ],
}

export const NPV_EVENTHUB_PRESET: NPVInputs = {
  discountRate: 10,
  initialInvestment: 410000,
  yearlyFlows: [
    { year: 1, cashFlow: 80000 },
    { year: 2, cashFlow: 120000 },
    { year: 3, cashFlow: 160000 },
    { year: 4, cashFlow: 200000 },
    { year: 5, cashFlow: 240000 },
  ],
}
