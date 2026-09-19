import { SalaryCostDonutChart, type SalaryCostSlice } from "./SalaryCostDonutChart";

export type DepartmentSalaryCost = {
  department: string;
  salaryCost: string;
};

type SalaryCostByDepartmentChartProps = {
  reportingCurrency: string;
  organizationTotal: string;
  departments: DepartmentSalaryCost[];
  loading?: boolean;
  embedded?: boolean;
};

export function SalaryCostByDepartmentChart({
  reportingCurrency,
  organizationTotal,
  departments,
  loading = false,
  embedded = false,
}: SalaryCostByDepartmentChartProps) {
  const slices: SalaryCostSlice[] = departments.map((row) => ({
    label: row.department,
    value: row.salaryCost,
  }));

  return (
    <SalaryCostDonutChart
      title="Salary Cost by Department"
      subtitle="How total pay is split across departments"
      emptyMessage="No salary data available by department."
      loadingMessage="Loading salary cost by department…"
      ariaLabel={`Salary cost by department in ${reportingCurrency}`}
      reportingCurrency={reportingCurrency}
      organizationTotal={organizationTotal}
      slices={slices}
      loading={loading}
      embedded={embedded}
    />
  );
}
