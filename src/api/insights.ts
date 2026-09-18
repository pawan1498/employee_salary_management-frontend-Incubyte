import { apiFetch } from "./api";
import type { InsightsParams, InsightsResponse } from "../types/insights";

export function getInsights(params: InsightsParams) {
  return apiFetch<InsightsResponse>("/api/insights", {}, params);
}
