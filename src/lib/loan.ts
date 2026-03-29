/** Fixed-rate amortizing loan: monthly payment (principal only, after down payment). */
export function monthlyPayment(
  principal: number,
  annualRatePercent: number,
  termMonths: number,
): number {
  if (principal <= 0 || termMonths <= 0) return NaN;
  if (annualRatePercent <= 0) return principal / termMonths;
  const r = annualRatePercent / 100 / 12;
  const pow = Math.pow(1 + r, termMonths);
  return (principal * r * pow) / (pow - 1);
}
