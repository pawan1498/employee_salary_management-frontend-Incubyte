function formatCurrencyAmount(amount: string, currency: string): string {
  const value = Number(amount);

  if (Number.isNaN(value)) {
    return amount;
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return value.toLocaleString();
  }
}

export function formatAmount(amount: string, currency: string): string {
  return formatCurrencyAmount(amount, currency);
}

export function formatMoney(amount: string, currency: string): string {
  return `${formatCurrencyAmount(amount, currency)} ${currency}`;
}

export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);

  if (!year || !month || !day) {
    return isoDate;
  }

  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
