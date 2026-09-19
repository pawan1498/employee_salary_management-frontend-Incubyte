import { apiFetch } from "./api";
import type { FiltersResponse } from "../types/filters";

export function getFilters() {
  return apiFetch<FiltersResponse>("/api/filters");
}
