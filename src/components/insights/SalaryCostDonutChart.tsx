import { useState } from "react";
import { Box, CircularProgress, Collapse, Paper, Tooltip, Typography } from "@mui/material";
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
  centerSubtitle = "",
}: SalaryCostDonutChartProps) {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

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

  function toggleSlice(label: string) {
    setSelectedLabel((current) => (current === label ? null : label));
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
        sx={{ p: { xs: 2, sm: 3 }, display: "flex", alignItems: "center", gap: 2 }}
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
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
        {emptyContent}
      </Paper>
    );
  }

  const visualTotal = slices.reduce((sum, slice) => sum + slice.value, 0);
  const donutSlices = buildDonutSlices(
    slices.map(({ label, value }) => ({ label, value })),
    visualTotal,
  );

  const selectedSlice = donutSlices.find((slice) => slice.label === selectedLabel) ?? null;
  const selectedIndex = selectedSlice
    ? donutSlices.findIndex((slice) => slice.label === selectedSlice.label)
    : -1;
  const selectedPercentage = selectedSlice
    ? departmentCostPercentage(String(selectedSlice.value), organizationTotal) ??
      selectedSlice.percentage
    : 0;

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
        <Box sx={{ flex: 1, minWidth: 0 }}>
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
            flexShrink: 0,
          }}
        >
          {reportingCurrency}
        </Box>
      </Box>

      <Typography
        color="text.secondary"
        sx={{ fontSize: "0.8rem", mb: 1.5, display: { xs: "block", sm: "none" } }}
      >
        Tap a slice or legend item to see details.
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 2, sm: 3 },
          alignItems: { xs: "stretch", sm: "center" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flexShrink: 0,
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <Box
            component="svg"
            viewBox="0 0 200 200"
            role="img"
            aria-label={ariaLabel}
            sx={{
              width: { xs: "min(100%, 280px)", sm: 280 },
              maxWidth: 280,
              height: "auto",
              touchAction: "manipulation",
            }}
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
                departmentCostPercentage(String(slice.value), organizationTotal) ??
                slice.percentage;
              const isSelected = selectedLabel === slice.label;
              const isDimmed = selectedLabel !== null && !isSelected;

              return (
                <Tooltip
                  key={slice.label}
                  title={
                    <Box sx={{ p: 0.25 }}>
                      <Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                        {slice.label}
                      </Typography>
                      <Typography sx={{ fontSize: "0.8rem" }}>
                        {formatTooltipDetail(slice.value)}
                      </Typography>
                      <Typography sx={{ fontSize: "0.8rem" }}>
                        {percentage.toFixed(1)}% of total
                      </Typography>
                    </Box>
                  }
                  arrow
                  placement="top"
                  enterTouchDelay={0}
                  leaveTouchDelay={2500}
                >
                  <g
                    role="button"
                    tabIndex={0}
                    aria-label={`${slice.label}: ${formatTooltipDetail(slice.value)}, ${percentage.toFixed(1)}% of total`}
                    aria-pressed={isSelected}
                    onClick={() => toggleSlice(slice.label)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        toggleSlice(slice.label);
                      }
                    }}
                    style={{ cursor: "pointer", touchAction: "manipulation", outline: "none" }}
                  >
                    <path
                      d={path}
                      fill={colorForIndex(index)}
                      stroke="#fff"
                      strokeWidth={isSelected ? 3 : 2}
                      opacity={isDimmed ? 0.4 : 1}
                      style={{ transition: "opacity 0.15s ease, stroke-width 0.15s ease" }}
                    />
                  </g>
                </Tooltip>
              );
            })}
            <text
              x={CX}
              y={centerSubtitle ? CY - 4 : CY + 4}
              textAnchor="middle"
              fill="#64748b"
              fontSize="13"
              fontWeight="600"
            >
              {reportingCurrency}
            </text>
            {centerSubtitle ? (
              <text x={CX} y={CY + 12} textAnchor="middle" fill="#94a3b8" fontSize="10">
                {centerSubtitle}
              </text>
            ) : null}
          </Box>

          <Collapse in={selectedSlice !== null} sx={{ width: "100%", maxWidth: 280 }}>
            {selectedSlice ? (
              <Box
                sx={{
                  mt: 1.5,
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: "primary.light",
                  border: "1px solid",
                  borderColor: "primary.main",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: colorForIndex(selectedIndex),
                      flexShrink: 0,
                    }}
                  />
                  <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
                    {selectedSlice.label}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
                  {formatSliceValue(selectedSlice.value)}
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                  {selectedPercentage.toFixed(1)}% of total
                </Typography>
              </Box>
            ) : null}
          </Collapse>
        </Box>

        <Box
          component="ul"
          sx={{
            listStyle: "none",
            m: 0,
            p: 0,
            flex: 1,
            minWidth: { xs: 0, sm: 200 },
            maxHeight: { xs: "none", sm: 280 },
            overflowY: { xs: "visible", sm: "auto" },
            width: "100%",
          }}
        >
          {donutSlices.map((slice, index) => {
            const percentage =
              departmentCostPercentage(String(slice.value), organizationTotal) ?? slice.percentage;
            const isSelected = selectedLabel === slice.label;

            return (
              <Box
                component="li"
                key={slice.label}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={() => toggleSlice(slice.label)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    toggleSlice(slice.label);
                  }
                }}
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "12px 1fr auto",
                    sm: "12px 1fr auto auto",
                  },
                  gap: 1,
                  alignItems: "center",
                  mb: 1,
                  fontSize: "0.875rem",
                  py: 1,
                  px: 1,
                  mx: -1,
                  borderRadius: 1,
                  cursor: "pointer",
                  touchAction: "manipulation",
                  bgcolor: isSelected ? "primary.light" : "transparent",
                  border: "1px solid",
                  borderColor: isSelected ? "primary.main" : "transparent",
                  transition: "background-color 0.15s ease, border-color 0.15s ease",
                  "&:hover": {
                    bgcolor: isSelected ? "primary.light" : "action.hover",
                  },
                  "&:focus-visible": {
                    outline: "2px solid",
                    outlineColor: "primary.main",
                    outlineOffset: 1,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    bgcolor: colorForIndex(index),
                    opacity: selectedLabel && !isSelected ? 0.45 : 1,
                  }}
                />
                <Typography component="span" sx={{ fontWeight: isSelected ? 700 : 500 }}>
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
                  sx={{
                    fontVariantNumeric: "tabular-nums",
                    minWidth: 48,
                    textAlign: "right",
                    display: { xs: "none", sm: "block" },
                  }}
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
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
      {chartContent}
    </Paper>
  );
}
