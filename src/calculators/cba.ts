export interface CBAInputs {
  purchaseCost: number
  installationCost: number
  annualOperatingCost: number
  annualBenefit: number
  lifeOfProject: number
  salvageValue: number
}

export interface CBAResult {
  totalCost: number
  totalBenefits: number
  totalBenefitsWithSalvage: number
  netBenefits: number
  accepted: boolean
}

export function calculateCBA(inputs: CBAInputs): CBAResult {
  const totalCost =
    inputs.purchaseCost +
    inputs.installationCost +
    inputs.annualOperatingCost * inputs.lifeOfProject

  const totalBenefits = inputs.annualBenefit * inputs.lifeOfProject
  const totalBenefitsWithSalvage = totalBenefits + inputs.salvageValue
  const netBenefits = totalBenefitsWithSalvage - totalCost

  return {
    totalCost,
    totalBenefits,
    totalBenefitsWithSalvage,
    netBenefits,
    accepted: netBenefits > 0,
  }
}

export const CBA_FACULTY_EXAMPLE: CBAInputs = {
  purchaseCost: 500000,
  installationCost: 50000,
  annualOperatingCost: 120000,
  annualBenefit: 250000,
  lifeOfProject: 5,
  salvageValue: 50000,
}

export const CBA_EVENTHUB_PRESET: CBAInputs = {
  purchaseCost: 350000,
  installationCost: 30000,
  annualOperatingCost: 80000,
  annualBenefit: 220000,
  lifeOfProject: 5,
  salvageValue: 25000,
}
