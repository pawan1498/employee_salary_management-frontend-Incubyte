import { BASE_CURRENCY_KEY } from "../constants/storage";
import type { Filters } from "../types/filters";

export function resolveBaseCurrency(filters: Filters): string {
  const saved = localStorage.getItem(BASE_CURRENCY_KEY);
  const { currencies, default_base_currency } = filters;

  if (saved && currencies.includes(saved)) {
    return saved;
  }

  if (currencies.includes(default_base_currency)) {
    return default_base_currency;
  }

  return currencies[0] ?? default_base_currency;
}

export function saveBaseCurrency(currency: string) {
  localStorage.setItem(BASE_CURRENCY_KEY, currency);
}
