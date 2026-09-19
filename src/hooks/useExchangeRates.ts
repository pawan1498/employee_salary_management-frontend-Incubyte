import { useEffect, useState } from "react";
import { ApiError } from "../api/api";
import { getExchangeRates, type ExchangeRates } from "../api/exchangeRates";

export function useExchangeRates(baseCurrency: string) {
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!baseCurrency) {
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const result = await getExchangeRates(baseCurrency);
        if (!cancelled) {
          setRates(result.data);
        }
      } catch (err) {
        if (!cancelled) {
          setRates(null);
          if (err instanceof ApiError) {
            setError(err.errors.join(" ") || "Unable to load currency rates.");
          } else {
            setError("Unable to load currency rates.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [baseCurrency, reloadKey]);

  return {
    rates,
    loading,
    error,
    retry: () => setReloadKey((key) => key + 1),
  };
}
