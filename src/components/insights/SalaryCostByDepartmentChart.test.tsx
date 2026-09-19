import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SalaryCostByDepartmentChart } from "./SalaryCostByDepartmentChart";

afterEach(() => {
  cleanup();
});

const sampleDepartments = [
  { department: "Engineering", salaryCost: "4200000.00" },
  { department: "Sales", salaryCost: "2800000.00" },
  { department: "Operations", salaryCost: "1900000.00" },
];

describe("SalaryCostByDepartmentChart", () => {
  it("renders department salary costs and reporting currency", () => {
    render(
      <SalaryCostByDepartmentChart
        reportingCurrency="USD"
        organizationTotal="8900000.00"
        departments={sampleDepartments}
      />,
    );

    expect(screen.getByText("Salary Cost by Department")).toBeInTheDocument();
    expect(screen.getAllByText("USD").length).toBeGreaterThan(0);
    expect(screen.getByText("Engineering")).toBeInTheDocument();
    expect(screen.getByText("Sales")).toBeInTheDocument();
    expect(screen.getByText("Operations")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /salary cost by department in usd/i })).toBeInTheDocument();
  });

  it("shows empty state when no department salary data exists", () => {
    render(
      <SalaryCostByDepartmentChart
        reportingCurrency="USD"
        organizationTotal="0.00"
        departments={[]}
      />,
    );

    expect(screen.getByText("No salary data available by department.")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(
      <SalaryCostByDepartmentChart
        reportingCurrency="USD"
        organizationTotal="8900000.00"
        departments={sampleDepartments}
        loading
      />,
    );

    expect(screen.getByText("Loading salary cost by department…")).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /salary cost by department/i })).not.toBeInTheDocument();
  });
});
