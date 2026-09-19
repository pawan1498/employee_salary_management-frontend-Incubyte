import { apiFetch } from "./api";

export type ExchangeRates = {
  base_currency: string;
  rates_as_of: string;
  rates: Record<string, string>;
};

export type ExchangeRatesResponse = {
  data: ExchangeRates;
};

export function getExchangeRates(baseCurrency: string) {
  return apiFetch<ExchangeRatesResponse>("/api/exchange_rates", {}, { base_currency: baseCurrency });
}
