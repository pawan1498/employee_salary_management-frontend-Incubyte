import { describe, expect, it } from "vitest";
import { buildDonutSlices, departmentCostPercentage } from "./donutGeometry";

describe("donutGeometry", () => {
  it("builds contiguous donut slices from positive values", () => {
    const slices = buildDonutSlices(
      [
        { label: "Engineering", value: 4200000 },
        { label: "Sales", value: 2800000 },
      ],
      7000000,
    );

    expect(slices).toHaveLength(2);
    expect(slices[0]?.startAngle).toBe(0);
    expect(slices[0]?.endAngle).toBeCloseTo(216, 0);
    expect(slices[1]?.startAngle).toBeCloseTo(216, 0);
    expect(slices[1]?.endAngle).toBe(360);
  });

  it("calculates department percentage from API totals", () => {
    expect(departmentCostPercentage("4200000", "8900000")).toBeCloseTo(47.191, 2);
    expect(departmentCostPercentage("0", "8900000")).toBe(0);
    expect(departmentCostPercentage("100", "0")).toBeNull();
  });
});
