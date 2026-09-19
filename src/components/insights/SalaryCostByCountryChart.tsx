import { SalaryCostDonutChart, type SalaryCostSlice } from "./SalaryCostDonutChart";

export type CountrySalaryCost = {
  country: string;
  salaryCost: string;
};

type SalaryCostByCountryChartProps = {
  reportingCurrency: string;
  organizationTotal: string;
  countries: CountrySalaryCost[];
  loading?: boolean;
  embedded?: boolean;
};

export function SalaryCostByCountryChart({
  reportingCurrency,
  organizationTotal,
  countries,
  loading = false,
  embedded = false,
}: SalaryCostByCountryChartProps) {
  const slices: SalaryCostSlice[] = countries.map((row) => ({
    label: row.country,
    value: row.salaryCost,
  }));

  return (
    <SalaryCostDonutChart
      title="Salary Cost by Country"
      subtitle="Share of total salary cost across countries"
      emptyMessage="No salary data available by country."
      loadingMessage="Loading salary cost by country…"
      ariaLabel={`Salary cost by country in ${reportingCurrency}`}
      reportingCurrency={reportingCurrency}
      organizationTotal={organizationTotal}
      slices={slices}
      loading={loading}
      embedded={embedded}
    />
  );
}
