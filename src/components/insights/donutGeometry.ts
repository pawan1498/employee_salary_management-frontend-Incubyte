export type DonutSliceInput = {
  label: string;
  value: number;
};

export type DonutSlice = DonutSliceInput & {
  startAngle: number;
  endAngle: number;
  percentage: number;
};

export function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

export function describeDonutSlice(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
) {
  if (endAngle - startAngle >= 360) {
    endAngle = startAngle + 359.999;
  }

  const startOuter = polarToCartesian(cx, cy, outerRadius, startAngle);
  const endOuter = polarToCartesian(cx, cy, outerRadius, endAngle);
  const startInner = polarToCartesian(cx, cy, innerRadius, endAngle);
  const endInner = polarToCartesian(cx, cy, innerRadius, startAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${endInner.x} ${endInner.y}`,
    "Z",
  ].join(" ");
}

export function buildDonutSlices(items: DonutSliceInput[], total: number): DonutSlice[] {
  if (total <= 0) {
    return [];
  }

  let cursor = 0;
  return items.map((item) => {
    const startAngle = (cursor / total) * 360;
    cursor += item.value;
    const endAngle = (cursor / total) * 360;

    return {
      ...item,
      startAngle,
      endAngle,
      percentage: (item.value / total) * 100,
    };
  });
}

export function departmentCostPercentage(deptCost: string, organizationTotal: string): number | null {
  const dept = Number(deptCost);
  const total = Number(organizationTotal);

  if (Number.isNaN(dept) || Number.isNaN(total) || total <= 0) {
    return null;
  }

  return (dept / total) * 100;
}
