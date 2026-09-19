import type { DistributionBucket } from "../../types/insights";
import { SalaryCostDonutChart, type SalaryCostSlice } from "./SalaryCostDonutChart";

type SalaryRangeDistributionChartProps = {
  baseCurrency: string;
  distribution: DistributionBucket[];
  embedded?: boolean;
};

export function SalaryRangeDistributionChart({
  baseCurrency,
  distribution,
  embedded = false,
}: SalaryRangeDistributionChartProps) {
  const slices: SalaryCostSlice[] = distribution.map((row) => ({
    label: row.bucket,
    value: String(row.headcount),
  }));
  const organizationTotal = String(
    distribution.reduce((sum, row) => sum + row.headcount, 0),
  );

  return (
    <SalaryCostDonutChart
      title="Headcount by Salary Range"
      subtitle={`Employee share across fixed salary buckets in ${baseCurrency}`}
      emptyMessage="No salary range data for these filters."
      loadingMessage="Loading salary range distribution…"
      ariaLabel={`Headcount by salary range in ${baseCurrency}`}
      reportingCurrency={baseCurrency}
      organizationTotal={organizationTotal}
      slices={slices}
      embedded={embedded}
      valueKind="headcount"
      sortSlices={false}
      centerSubtitle="ranges"
    />
  );
}
