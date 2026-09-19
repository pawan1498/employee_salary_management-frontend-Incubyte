export type CountryBreakdown = {
  country: string;
  headcount: number;
  total: string;
  average: string;
};

export type DepartmentBreakdown = {
  department: string;
  headcount: number;
  total: string;
  average: string;
};

export type DistributionBucket = {
  bucket: string;
  headcount: number;
};

export type Insights = {
  base_currency: string;
  rates_as_of: string;
  headcount: number;
  total: string;
  average: string;
  median: string;
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
  base_currency?: string;
};
