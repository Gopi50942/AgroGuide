// ─────────────────────────────────────────────
// Standard reducing-balance EMI formula. Pure math — no external data,
// no fabricated rates. The UI is responsible for clearly labeling the
// result as an estimate; actual loan terms always depend on the lender.
// ─────────────────────────────────────────────

export interface EmiResult {
  monthlyEmi: number;
  totalRepayment: number;
  totalInterest: number;
}

export function calculateEmi(principal: number, annualRatePercent: number, tenureMonths: number): EmiResult {
  if (principal <= 0 || tenureMonths <= 0) {
    return { monthlyEmi: 0, totalRepayment: 0, totalInterest: 0 };
  }
  if (annualRatePercent <= 0) {
    const monthlyEmi = principal / tenureMonths;
    return { monthlyEmi, totalRepayment: principal, totalInterest: 0 };
  }

  const monthlyRate = annualRatePercent / 12 / 100;
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const monthlyEmi = (principal * monthlyRate * factor) / (factor - 1);
  const totalRepayment = monthlyEmi * tenureMonths;
  const totalInterest = totalRepayment - principal;

  return { monthlyEmi, totalRepayment, totalInterest };
}
