import { useEffect, useState } from "react";
import type { Filters } from "../types/filters";
import { resolveBaseCurrency, saveBaseCurrency } from "../utils/baseCurrency";

export function useBaseCurrency(filters: Filters | null) {
  const [baseCurrency, setBaseCurrencyState] = useState("");

  useEffect(() => {
    if (!filters) {
      return;
    }
    setBaseCurrencyState(resolveBaseCurrency(filters));
  }, [filters]);

  function setBaseCurrency(value: string) {
    setBaseCurrencyState(value);
    saveBaseCurrency(value);
  }

  return {
    baseCurrency,
    setBaseCurrency,
    currencies: filters?.currencies ?? [],
  };
}
