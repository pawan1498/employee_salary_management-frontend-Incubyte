import { Box, CircularProgress, Paper, Tooltip, Typography } from "@mui/material";
import { formatAmount } from "../../format";
import { colorForIndex } from "./chartColors";
import { buildDonutSlices, describeDonutSlice, departmentCostPercentage } from "./donutGeometry";

export type SalaryCostSlice = {
  label: string;
  value: string;
};

type SalaryCostDonutChartProps = {
  title: string;
  subtitle: string;
  emptyMessage: string;
  loadingMessage: string;
  ariaLabel: string;
  reportingCurrency: string;
  organizationTotal: string;
  slices: SalaryCostSlice[];
  loading?: boolean;
  embedded?: boolean;
  valueKind?: "money" | "headcount";
  sortSlices?: boolean;
  centerSubtitle?: string;
};

const CX = 100;
const CY = 100;
const OUTER_RADIUS = 88;
const INNER_RADIUS = 54;

export function SalaryCostDonutChart({
  title,
  subtitle,
  emptyMessage,
  loadingMessage,
  ariaLabel,
  reportingCurrency,
  organizationTotal,
  slices: inputSlices,
  loading = false,
  embedded = false,
  valueKind = "money",
  sortSlices = true,
  centerSubtitle = "reporting",
}: SalaryCostDonutChartProps) {
  function formatSliceValue(value: number): string {
    if (valueKind === "headcount") {
      return value.toLocaleString();
    }
    return formatAmount(String(value), reportingCurrency);
  }

  function formatTooltipDetail(value: number): string {
    if (valueKind === "headcount") {
      return `${value.toLocaleString()} employees`;
    }
    return formatAmount(String(value), reportingCurrency);
  }
  if (loading) {
    const loadingContent = (
      <>
        <CircularProgress size={22} thickness={4} />
        <Typography color="text.secondary">{loadingMessage}</Typography>
      </>
    );

    if (embedded) {
      return (
        <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>{loadingContent}</Box>
      );
    }

    return (
      <Paper
        variant="outlined"
        aria-busy="true"
        sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}
      >
        {loadingContent}
      </Paper>
    );
  }

  const slices = inputSlices
    .map((row) => ({
      label: row.label,
      value: Number(row.value),
      rawValue: row.value,
    }))
    .filter((row) => !Number.isNaN(row.value) && row.value > 0);

  if (sortSlices) {
    slices.sort((a, b) => b.value - a.value);
  }

  if (slices.length === 0) {
    const emptyContent = (
      <>
        <Typography variant="h6" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </>
    );

    if (embedded) {
      return <Box sx={{ mb: 3 }}>{emptyContent}</Box>;
    }

    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
        {emptyContent}
      </Paper>
    );
  }

  const visualTotal = slices.reduce((sum, slice) => sum + slice.value, 0);
  const donutSlices = buildDonutSlices(
    slices.map(({ label, value }) => ({ label, value })),
    visualTotal,
  );

  const chartContent = (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
          mb: 2.5,
        }}
      >
        <Box>
          <Typography variant="h6">{title}</Typography>
          <Typography color="text.secondary" sx={{ fontSize: "0.875rem", mt: 0.5 }}>
            {subtitle}
          </Typography>
        </Box>
        <Box
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            bgcolor: "action.hover",
            fontSize: "0.8rem",
            fontWeight: 700,
            letterSpacing: "0.04em",
          }}
        >
          {reportingCurrency}
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", alignItems: "center" }}>
        <Box
          component="svg"
          viewBox="0 0 200 200"
          role="img"
          aria-label={ariaLabel}
          sx={{ width: { xs: "100%", sm: 280 }, maxWidth: 280, height: "auto", flexShrink: 0 }}
        >
          {donutSlices.map((slice, index) => {
            const path = describeDonutSlice(
              CX,
              CY,
              INNER_RADIUS,
              OUTER_RADIUS,
              slice.startAngle,
              slice.endAngle,
            );
            const percentage =
              departmentCostPercentage(String(slice.value), organizationTotal) ?? slice.percentage;

            return (
              <Tooltip
                key={slice.label}
                title={
                  <Box sx={{ p: 0.25 }}>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>{slice.label}</Typography>
                    <Typography sx={{ fontSize: "0.8rem" }}>{formatTooltipDetail(slice.value)}</Typography>
                    <Typography sx={{ fontSize: "0.8rem" }}>{percentage.toFixed(1)}% of total</Typography>
                  </Box>
                }
                arrow
                placement="top"
              >
                <g style={{ cursor: "pointer" }}>
                  <path d={path} fill={colorForIndex(index)} stroke="#fff" strokeWidth={2} />
                </g>
              </Tooltip>
            );
          })}
          <text x={CX} y={CY - 4} textAnchor="middle" fill="#64748b" fontSize="13" fontWeight="600">
            {reportingCurrency}
          </text>
          <text x={CX} y={CY + 12} textAnchor="middle" fill="#94a3b8" fontSize="10">
            {centerSubtitle}
          </text>
        </Box>

        <Box
          component="ul"
          sx={{
            listStyle: "none",
            m: 0,
            p: 0,
            flex: 1,
            minWidth: 240,
            maxHeight: 280,
            overflowY: "auto",
          }}
        >
          {donutSlices.map((slice, index) => {
            const percentage =
              departmentCostPercentage(String(slice.value), organizationTotal) ?? slice.percentage;

            return (
              <Box
                component="li"
                key={slice.label}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "12px 1fr auto auto",
                  gap: 1,
                  alignItems: "center",
                  mb: 1.25,
                  fontSize: "0.875rem",
                }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    bgcolor: colorForIndex(index),
                  }}
                />
                <Typography component="span" sx={{ fontWeight: 500 }}>
                  {slice.label}
                </Typography>
                <Typography
                  component="span"
                  sx={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}
                >
                  {formatSliceValue(slice.value)}
                </Typography>
                <Typography
                  component="span"
                  color="text.secondary"
                  sx={{ fontVariantNumeric: "tabular-nums", minWidth: 48, textAlign: "right" }}
                >
                  {percentage.toFixed(1)}%
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </>
  );

  if (embedded) {
    return <Box sx={{ mb: 3 }}>{chartContent}</Box>;
  }

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      {chartContent}
    </Paper>
  );
}
