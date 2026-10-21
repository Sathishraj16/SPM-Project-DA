import { calculateNPV, type NPVInputs } from './npv'

export interface BCRResult {
  pvOfBenefits: number
  pvOfCost: number
  bcr: number
  status: 'accept' | 'breakeven' | 'reject'
}

export function calculateBCR(inputs: NPVInputs): BCRResult {
  const npvResult = calculateNPV(inputs)
  const bcr = npvResult.pvOfBenefits / npvResult.pvOfCost

  let status: 'accept' | 'breakeven' | 'reject'
  if (bcr > 1.0) status = 'accept'
  else if (bcr === 1.0) status = 'breakeven'
  else status = 'reject'

  return {
    pvOfBenefits: npvResult.pvOfBenefits,
    pvOfCost: npvResult.pvOfCost,
    bcr,
    status,
  }
}
