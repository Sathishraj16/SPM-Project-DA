export interface CashFlowInputs {
  openingCashBalance: number
  cashSale: number
  creditCollection: number
  paymentPurchase: number
  salary: number
  rent: number
  otherExpenses: number
}

export interface CashFlowResult {
  netCashFlow: number
  totalCashAvailable: number
  totalCashPayment: number
  closingCashBalance: number
  healthy: boolean
}

export function calculateCashFlow(inputs: CashFlowInputs): CashFlowResult {
  const totalCashAvailable =
    inputs.openingCashBalance + inputs.cashSale + inputs.creditCollection

  const totalCashPayment =
    inputs.paymentPurchase + inputs.salary + inputs.rent + inputs.otherExpenses

  const closingCashBalance = totalCashAvailable - totalCashPayment
  const netCashFlow = inputs.cashSale + inputs.creditCollection - totalCashPayment

  return {
    netCashFlow,
    totalCashAvailable,
    totalCashPayment,
    closingCashBalance,
    healthy: closingCashBalance > 0,
  }
}

export const CASHFLOW_FACULTY_EXAMPLE: CashFlowInputs = {
  openingCashBalance: 40000,
  cashSale: 150000,
  creditCollection: 80000,
  paymentPurchase: 90000,
  salary: 40000,
  rent: 15000,
  otherExpenses: 10000,
}

export const CASHFLOW_EVENTHUB_PRESET: CashFlowInputs = {
  openingCashBalance: 60000,
  cashSale: 200000,
  creditCollection: 100000,
  paymentPurchase: 120000,
  salary: 80000,
  rent: 25000,
  otherExpenses: 20000,
}
