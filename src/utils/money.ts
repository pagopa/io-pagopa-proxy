export function exactConvertToCents(amount: number): number {
  const parts = String(amount).split(".");
  if (parts.length === 1) {
    // no decimals
    return amount * 100;
  }
  const decimals = (
    parts[1] + "0".repeat(parts[1].length < 2 ? 2 - parts[1].length : 0)
  ).slice(0, 2);

  return parseInt(`${parts[0]}${decimals}`, 10);
}
