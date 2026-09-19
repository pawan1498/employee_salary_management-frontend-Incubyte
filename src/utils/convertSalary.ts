export function convertToBaseCurrency(
  amount: string,
  fromCurrency: string,
  baseCurrency: string,
  rates: Record<string, string>,
): string | null {
  if (fromCurrency === baseCurrency) {
    return amount;
  }

  const rate = rates[fromCurrency];
  if (!rate || Number(rate) === 0) {
    return null;
  }

  const converted = Number(amount) / Number(rate);
  if (Number.isNaN(converted)) {
    return null;
  }

  return converted.toFixed(2);
}
