/** Wallet amounts are stored in poisha (1 BDT = 100). */
export function formatBdt(minorUnits: number): string {
  const taka = minorUnits / 100;
  return `${taka.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ৳`;
}
