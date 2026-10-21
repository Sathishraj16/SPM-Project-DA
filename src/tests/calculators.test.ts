import { describe, it, expect } from 'vitest'
import { calculateCBA, CBA_FACULTY_EXAMPLE } from '../calculators/cba'
import { calculateCashFlow, CASHFLOW_FACULTY_EXAMPLE } from '../calculators/cashflow'
import { calculatePayback, PAYBACK_FACULTY_EXAMPLES } from '../calculators/paybackRoi'
import { calculateNPV, NPV_FACULTY_EXAMPLE } from '../calculators/npv'
import { calculateBCR } from '../calculators/bcr'
import { calculateIRR } from '../calculators/irr'
import { calculateRisk, DEFAULT_RISK_THRESHOLDS } from '../calculators/risk'
import { calculateCPM, CPM_FACULTY_ACTIVITIES } from '../calculators/cpm'
import { calculateCostSlope, CRASHING_FACULTY_EXAMPLE } from '../calculators/crashing'
import { calculatePERT } from '../calculators/pert'
import { calculateFPA, FPA_DEFAULT_GSCS } from '../calculators/fpa'
import { calculateObjectPoints, OP_FACULTY_EXAMPLE, isWeightSpecified, getWeight } from '../calculators/objectPoints'
import type { FunctionComponent } from '../calculators/fpa'

// ─── CBA ────────────────────────────────────────────────────────────────────
describe('CBA', () => {
  it('reproduces faculty example: Total Cost = 1,150,000', () => {
    const r = calculateCBA(CBA_FACULTY_EXAMPLE)
    expect(r.totalCost).toBe(1150000)
  })
  it('reproduces faculty example: Total Benefits with Salvage = 1,300,000', () => {
    const r = calculateCBA(CBA_FACULTY_EXAMPLE)
    expect(r.totalBenefitsWithSalvage).toBe(1300000)
  })
  it('reproduces faculty example: Net Benefits = 150,000', () => {
    const r = calculateCBA(CBA_FACULTY_EXAMPLE)
    expect(r.netBenefits).toBe(150000)
  })
  it('accepts positive net benefits', () => {
    expect(calculateCBA(CBA_FACULTY_EXAMPLE).accepted).toBe(true)
  })
  it('rejects negative net benefits', () => {
    const result = calculateCBA({ purchaseCost: 1000000, installationCost: 0, annualOperatingCost: 0, annualBenefit: 100000, lifeOfProject: 5, salvageValue: 0 })
    expect(result.accepted).toBe(false)
  })
})

// ─── CASH FLOW ───────────────────────────────────────────────────────────────
describe('CashFlow', () => {
  it('reproduces Total Cash Available = 270,000', () => {
    const r = calculateCashFlow(CASHFLOW_FACULTY_EXAMPLE)
    expect(r.totalCashAvailable).toBe(270000)
  })
  it('reproduces Total Cash Payment = 155,000', () => {
    const r = calculateCashFlow(CASHFLOW_FACULTY_EXAMPLE)
    expect(r.totalCashPayment).toBe(155000)
  })
  it('reproduces Closing Cash Balance = 115,000', () => {
    const r = calculateCashFlow(CASHFLOW_FACULTY_EXAMPLE)
    expect(r.closingCashBalance).toBe(115000)
  })
  it('healthy when closing balance > 0', () => {
    expect(calculateCashFlow(CASHFLOW_FACULTY_EXAMPLE).healthy).toBe(true)
  })
  it('not healthy when closing balance <= 0', () => {
    const r = calculateCashFlow({ openingCashBalance: 0, cashSale: 10000, creditCollection: 0, paymentPurchase: 50000, salary: 0, rent: 0, otherExpenses: 0 })
    expect(r.healthy).toBe(false)
  })
})

// ─── PAYBACK & ROI ───────────────────────────────────────────────────────────
describe('Payback & ROI', () => {
  const [A, B, C] = PAYBACK_FACULTY_EXAMPLES

  it('Project A: Net Profit = 120,000', () => {
    expect(calculatePayback(A).netProfit).toBe(120000)
  })
  it('Project A: Payback = 4.2 years', () => {
    expect(calculatePayback(A).paybackPeriod).toBeCloseTo(4.2, 1)
  })
  it('Project A: ROI = 60%', () => {
    expect(calculatePayback(A).roi).toBeCloseTo(60, 1)
  })
  it('Project B: Net Profit = 150,000', () => {
    expect(calculatePayback(B).netProfit).toBe(150000)
  })
  it('Project B: Payback ≈ 4.25 years', () => {
    expect(calculatePayback(B).paybackPeriod).toBeCloseTo(4.25, 1)
  })
  it('Project B: ROI = 30%', () => {
    expect(calculatePayback(B).roi).toBeCloseTo(30, 1)
  })
  it('Project C: Net Profit = 50,000', () => {
    expect(calculatePayback(C).netProfit).toBe(50000)
  })
  it('Project C: Payback ≈ 4.5 years', () => {
    expect(calculatePayback(C).paybackPeriod).toBeCloseTo(4.5, 1)
  })
  it('Project C: ROI ≈ 16.67%', () => {
    expect(calculatePayback(C).roi).toBeCloseTo(16.67, 1)
  })
})

// ─── NPV ─────────────────────────────────────────────────────────────────────
describe('NPV', () => {
  it('Project A NPV ≈ 26,757 at 10% (exact fractions)', () => {
    const r = calculateNPV(NPV_FACULTY_EXAMPLE)
    expect(r.npv).toBeCloseTo(26757, -2)
  })
  it('Project A NPV = exactly 26,757 with faculty 4-decimal rounding', () => {
    // Faculty factors: 0.9091, 0.8264, 0.7513, 0.6830, 0.6209
    // PV: 36364 + 33056 + 30052 + 34150 + 93135 = 226757 → NPV = 26757
    const r = calculateNPV(NPV_FACULTY_EXAMPLE, true)
    expect(r.npv).toBeCloseTo(26757, 0)
  })
  it('Faculty rounding mode: year-1 discount factor rounded to exactly 0.9091', () => {
    const r = calculateNPV(NPV_FACULTY_EXAMPLE, true)
    expect(r.yearResults[0].discountFactor).toBe(0.9091)
  })
  it('Faculty rounding mode: year-5 discount factor rounded to exactly 0.6209', () => {
    const r = calculateNPV(NPV_FACULTY_EXAMPLE, true)
    expect(r.yearResults[4].discountFactor).toBe(0.6209)
  })
  it('Discount factors are correct for Year 1 at 10%', () => {
    const r = calculateNPV(NPV_FACULTY_EXAMPLE)
    expect(r.yearResults[0].discountFactor).toBeCloseTo(0.9091, 3)
  })
  it('Year 5 discount factor ≈ 0.6209', () => {
    const r = calculateNPV(NPV_FACULTY_EXAMPLE)
    expect(r.yearResults[4].discountFactor).toBeCloseTo(0.6209, 3)
  })
  it('accepted when NPV > 0', () => {
    expect(calculateNPV(NPV_FACULTY_EXAMPLE).accepted).toBe(true)
  })
})

// ─── BCR ─────────────────────────────────────────────────────────────────────
describe('BCR', () => {
  it('Project A BCR ≈ 1.134', () => {
    const r = calculateBCR(NPV_FACULTY_EXAMPLE)
    expect(r.bcr).toBeCloseTo(1.134, 2)
  })
  it('status is accept for BCR > 1', () => {
    expect(calculateBCR(NPV_FACULTY_EXAMPLE).status).toBe('accept')
  })
  it('status is reject for BCR < 1', () => {
    const highCostInputs = { ...NPV_FACULTY_EXAMPLE, initialInvestment: 9999999 }
    expect(calculateBCR(highCostInputs).status).toBe('reject')
  })
})

// ─── IRR ─────────────────────────────────────────────────────────────────────
describe('IRR', () => {
  it('Project A IRR ≈ 14.15% using r1=10% r2=15%', () => {
    const r = calculateIRR(NPV_FACULTY_EXAMPLE, 10, 15)
    expect(r.irr).toBeCloseTo(14.15, 0)
  })
  it('accepted when IRR > r1', () => {
    const r = calculateIRR(NPV_FACULTY_EXAMPLE, 10, 15)
    expect(r.accepted).toBe(true)
  })
})

// ─── RISK ─────────────────────────────────────────────────────────────────────
describe('Risk', () => {
  it('exposure = probability × impact', () => {
    const r = calculateRisk({ id: '1', description: 'test', category: 'Technical', probability: 0.4, impact: 8 })
    expect(r.exposure).toBeCloseTo(0.4 * 8, 5)
  })
  it('high exposure → High level (default thresholds)', () => {
    const r = calculateRisk({ id: '2', description: 'test', category: 'Technical', probability: 0.8, impact: 9 })
    expect(r.level).toBe('High')
  })
  it('low exposure → Low level (default thresholds)', () => {
    const r = calculateRisk({ id: '3', description: 'test', category: 'Project', probability: 0.2, impact: 3 })
    expect(r.level).toBe('Low')
  })
  it('DEFAULT_RISK_THRESHOLDS: lowMax=3, medMax=6', () => {
    expect(DEFAULT_RISK_THRESHOLDS.lowMax).toBe(3)
    expect(DEFAULT_RISK_THRESHOLDS.medMax).toBe(6)
  })
  it('custom thresholds: exposure=4 is Low when lowMax=5', () => {
    const r = calculateRisk({ id: '4', description: 'test', category: 'Technical', probability: 0.4, impact: 10 }, { lowMax: 5, medMax: 8 })
    expect(r.exposure).toBeCloseTo(4, 5)
    expect(r.level).toBe('Low')
  })
  it('custom thresholds: exposure=4 is High when medMax=3.5', () => {
    const r = calculateRisk({ id: '5', description: 'test', category: 'Technical', probability: 0.4, impact: 10 }, { lowMax: 2, medMax: 3.5 })
    expect(r.level).toBe('High')
  })
  it('custom thresholds: exposure=5 is Medium when lowMax=3, medMax=6', () => {
    const r = calculateRisk({ id: '6', description: 'test', category: 'Business', probability: 0.5, impact: 10 }, { lowMax: 3, medMax: 6 })
    expect(r.level).toBe('Medium')
  })
})

// ─── CPM ─────────────────────────────────────────────────────────────────────
describe('CPM', () => {
  it('faculty 11-activity network: project duration = 22 weeks', () => {
    const r = calculateCPM(CPM_FACULTY_ACTIVITIES)
    expect(r.projectDuration).toBe(22)
  })
  it('identifies critical path including 1→3→6→8→9', () => {
    const r = calculateCPM(CPM_FACULTY_ACTIVITIES)
    const has1369 = r.criticalPaths.some(p => p.join('→') === '1→3→6→8→9')
    expect(has1369).toBe(true)
  })
  it('identifies critical path including 1→3→7→9', () => {
    const r = calculateCPM(CPM_FACULTY_ACTIVITIES)
    const has1379 = r.criticalPaths.some(p => p.join('→') === '1→3→7→9')
    expect(has1379).toBe(true)
  })
  it('critical activities have total float = 0', () => {
    const r = calculateCPM(CPM_FACULTY_ACTIVITIES)
    const criticalActivities = r.activities.filter(a => a.isCritical)
    expect(criticalActivities.every(a => a.totalFloat === 0)).toBe(true)
  })
})

// ─── CRASHING ────────────────────────────────────────────────────────────────
describe('Crashing', () => {
  it('Activity A: Cost Slope = 300 per day', () => {
    const r = calculateCostSlope(CRASHING_FACULTY_EXAMPLE[0])
    expect(r.costSlope).toBe(300)
  })
  it('Max crash = Normal Time − Crash Time', () => {
    const r = calculateCostSlope(CRASHING_FACULTY_EXAMPLE[0])
    expect(r.maxCrash).toBe(6 - 4)
  })
  it('zero slope when times are equal', () => {
    const r = calculateCostSlope({ id: 't', label: 'test', normalTime: 5, crashTime: 5, normalCost: 1000, crashCost: 2000 })
    expect(r.costSlope).toBe(0)
  })
})

// ─── PERT ─────────────────────────────────────────────────────────────────────
describe('PERT', () => {
  it('te = (O + 4m + P) / 6', () => {
    const r = calculatePERT([{ id: 'X', label: 'X', optimistic: 2, mostLikely: 4, pessimistic: 6, isCritical: true }])
    expect(r.activities[0].expectedTime).toBeCloseTo((2 + 16 + 6) / 6, 4)
  })
  it('σ = (P − O) / 6', () => {
    const r = calculatePERT([{ id: 'X', label: 'X', optimistic: 2, mostLikely: 4, pessimistic: 8, isCritical: true }])
    expect(r.activities[0].standardDeviation).toBeCloseTo((8 - 2) / 6, 4)
  })
  it('σ² = σ^2', () => {
    const r = calculatePERT([{ id: 'X', label: 'X', optimistic: 2, mostLikely: 4, pessimistic: 8, isCritical: true }])
    const sd = (8 - 2) / 6
    expect(r.activities[0].variance).toBeCloseTo(sd * sd, 4)
  })
  it('summing critical path only', () => {
    const activities = [
      { id: 'A', label: 'A', optimistic: 2, mostLikely: 4, pessimistic: 6, isCritical: true },
      { id: 'B', label: 'B', optimistic: 1, mostLikely: 2, pessimistic: 3, isCritical: false },
    ]
    const r = calculatePERT(activities)
    const teA = (2 + 16 + 6) / 6
    expect(r.totalExpectedTime).toBeCloseTo(teA, 4)
  })
})

// ─── FPA ─────────────────────────────────────────────────────────────────────
describe('FPA', () => {
  const components: FunctionComponent[] = [
    { id: '1', type: 'EI', label: 'A', count: 2, complexity: 'Low' },
    { id: '2', type: 'ILF', label: 'B', count: 1, complexity: 'High' },
  ]
  it('UFP = sum of weighted components', () => {
    const r = calculateFPA(components, FPA_DEFAULT_GSCS)
    expect(r.ufp).toBe(2 * 3 + 1 * 15)
  })
  it('VAF = 0.65 + 0.01 × TDI', () => {
    const r = calculateFPA(components, FPA_DEFAULT_GSCS)
    expect(r.vaf).toBeCloseTo(0.65 + 0.01 * r.tdi, 4)
  })
  it('FP = UFP × VAF', () => {
    const r = calculateFPA(components, FPA_DEFAULT_GSCS)
    expect(r.fp).toBeCloseTo(r.ufp * r.vaf, 4)
  })
  it('max TDI = 70 (14 × 5)', () => {
    const maxGSCs = FPA_DEFAULT_GSCS.map(g => ({ ...g, rating: 5 }))
    const r = calculateFPA(components, maxGSCs)
    expect(r.tdi).toBe(70)
  })
  it('VAF with TDI=35 ≈ 1.00', () => {
    const gsc35 = FPA_DEFAULT_GSCS.map((g, i) => ({ ...g, rating: i < 7 ? 3 : 2 }))
    const r = calculateFPA(components, gsc35)
    expect(r.tdi).toBe(35)
    expect(r.vaf).toBeCloseTo(1.00, 2)
  })
})

// ─── OBJECT POINTS ───────────────────────────────────────────────────────────
describe('ObjectPoints', () => {
  const { components, reuse, productivityLevel } = OP_FACULTY_EXAMPLE

  it('Object Point Count = 24', () => {
    const r = calculateObjectPoints(components, reuse, productivityLevel)
    expect(r.objectPointCount).toBe(24)
  })
  it('NOP = 21.6', () => {
    const r = calculateObjectPoints(components, reuse, productivityLevel)
    expect(r.nop).toBeCloseTo(21.6, 1)
  })
  it('Effort ≈ 3.086 P/M', () => {
    const r = calculateObjectPoints(components, reuse, productivityLevel)
    expect(r.effort).toBeCloseTo(3.086, 2)
  })
  it('100% reuse → NOP = 0', () => {
    const r = calculateObjectPoints(components, 100, productivityLevel)
    expect(r.nop).toBe(0)
  })
  it('isWeightSpecified: Screen Simple → true', () => {
    expect(isWeightSpecified('Screen', 'Simple')).toBe(true)
  })
  it('isWeightSpecified: Report Difficult → true', () => {
    expect(isWeightSpecified('Report', 'Difficult')).toBe(true)
  })
  it('isWeightSpecified: 3GL Simple → false (not in faculty PDF)', () => {
    expect(isWeightSpecified('3GL', 'Simple')).toBe(false)
  })
  it('isWeightSpecified: 3GL Medium → false (not in faculty PDF)', () => {
    expect(isWeightSpecified('3GL', 'Medium')).toBe(false)
  })
  it('isWeightSpecified: 3GL Difficult → true', () => {
    expect(isWeightSpecified('3GL', 'Difficult')).toBe(true)
  })
  it('getWeight: 3GL Simple returns fallback 0 by default', () => {
    expect(getWeight('3GL', 'Simple')).toBe(0)
  })
  it('getWeight: 3GL Simple returns custom fallback', () => {
    expect(getWeight('3GL', 'Simple', 5)).toBe(5)
  })
  it('getWeight: Screen Medium returns 2', () => {
    expect(getWeight('Screen', 'Medium')).toBe(2)
  })
  it('hasUnspecifiedWeights: true when 3GL Simple/Medium has count > 0', () => {
    const comps = [{ id: '1', type: '3GL' as const, label: 'test', count: 1, complexity: 'Simple' as const }]
    const r = calculateObjectPoints(comps, 0, 'Nominal')
    expect(r.hasUnspecifiedWeights).toBe(true)
  })
  it('hasUnspecifiedWeights: false when all components have specified weights', () => {
    const r = calculateObjectPoints(components, reuse, productivityLevel)
    expect(r.hasUnspecifiedWeights).toBe(false)
  })
})
