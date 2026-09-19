import { useEffect, useState } from "react";
import { getFilters } from "../api/filters";
import type { Filters } from "../types/filters";

export function useFilters() {
  const [filters, setFilters] = useState<Filters | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(false);

      try {
        const result = await getFilters();
        if (!cancelled) {
          setFilters(result.data);
        }
      } catch {
        if (!cancelled) {
          setFilters(null);
          setError(true);
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
  }, []);

  return { filters, loading, error };
}
