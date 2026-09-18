export type CurrencyBreakdown = {
  currency: string;
  headcount: number;
  total: string;
  average: string;
};

export type CountryBreakdown = {
  country: string;
  currency: string;
  headcount: number;
  total: string;
  average: string;
};

export type DepartmentBreakdown = {
  department: string;
  currency: string;
  headcount: number;
  total: string;
  average: string;
};

export type DistributionBucket = {
  currency: string;
  bucket: string;
  headcount: number;
};

export type Insights = {
  headcount: number;
  by_currency: CurrencyBreakdown[];
  by_country: CountryBreakdown[];
  by_department: DepartmentBreakdown[];
  distribution: DistributionBucket[];
};

export type InsightsResponse = {
  data: Insights;
};

export type InsightsParams = {
  country?: string;
  department?: string;
};
