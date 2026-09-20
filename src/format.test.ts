import { describe, expect, it } from "vitest";
import { formatAmount } from "./format";

describe("formatAmount", () => {
  it("formats INR with Indian digit grouping", () => {
    expect(formatAmount("4859020", "INR")).toBe("₹48,59,020");
    expect(formatAmount("4130167", "INR")).toBe("₹41,30,167");
  });

  it("formats USD with Western digit grouping", () => {
    expect(formatAmount("4859020", "USD")).toMatch(/\$4,859,020/);
  });
});
