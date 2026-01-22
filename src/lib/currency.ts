// Currency conversion utilities
// Exchange rate: 1 USD = ~15 GHS (updated periodically)
const USD_TO_GHS_RATE = 15;

export function usdToGhs(usdAmount: number): number {
  return Math.round(usdAmount * USD_TO_GHS_RATE);
}

export function usdToGhsPesewas(usdAmount: number): number {
  return usdToGhs(usdAmount) * 100; // Paystack uses pesewas
}

export function formatUsd(amount: number): string {
  return `$${amount}`;
}

export function formatGhs(amount: number): string {
  return `GH₵${amount}`;
}

export const EXCHANGE_RATE = USD_TO_GHS_RATE;
