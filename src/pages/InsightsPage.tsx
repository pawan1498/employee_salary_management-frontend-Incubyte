import { useEffect, useState, type ReactNode } from "react";
import {
  Box,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import { ApiError } from "../api/api";
import { getInsights } from "../api/insights";
import { ActiveFilterReadout } from "../components/ActiveFilterReadout";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { FilterBar } from "../components/FilterBar";
import { FilterSelect } from "../components/FilterSelect";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { SalaryCostByCountryChart } from "../components/insights/SalaryCostByCountryChart";
import { SalaryCostByDepartmentChart } from "../components/insights/SalaryCostByDepartmentChart";
import { SalaryRangeDistributionChart } from "../components/insights/SalaryRangeDistributionChart";
import { ReportingCurrencySelect } from "../components/ReportingCurrencySelect";
import { StatCard } from "../components/StatCard";
import { useBaseCurrency } from "../hooks/useBaseCurrency";
import { useFilters } from "../hooks/useFilters";
import { formatAmount, formatDate } from "../format";
import type { Insights } from "../types/insights";

type TabKey = "country" | "department" | "ranges";

export function InsightsPage() {
  const { filters, loading: filtersLoading, error: filtersError } = useFilters();
  const { baseCurrency, setBaseCurrency, currencies } = useBaseCurrency(filters);
  const [country, setCountry] = useState("");
  const [department, setDepartment] = useState("");
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [activeTab, setActiveTab] = useState<TabKey>("country");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!baseCurrency) {
        return;
      }

      setLoading(true);
      setErrorMessage(null);

      try {
        const result = await getInsights({
          country,
          department,
          base_currency: baseCurrency,
        });
        if (!cancelled) {
          setInsights(result.data);
        }
      } catch (err) {
        if (!cancelled) {
          setInsights(null);
          if (err instanceof ApiError) {
            setErrorMessage(err.errors.join(" ") || "Unable to load insights.");
          } else {
            setErrorMessage("Unable to load insights.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (filtersLoading || !baseCurrency) {
      return;
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [country, department, baseCurrency, reloadKey, filtersLoading]);

  function clearFilters() {
    setCountry("");
    setDepartment("");
  }

  if (filtersLoading) {
    return (
      <Box>
        <PageHeader
          title="Insights"
          subtitle="Compare total pay, averages, and breakdowns in one currency."
        />
        <LoadingState message="Loading filters…" />
      </Box>
    );
  }

  if (filtersError || !filters) {
    return (
      <Box>
        <PageHeader title="Insights" />
        <ErrorState message="Unable to load filter options." />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Insights"
        subtitle="Pick a currency to compare pay across the organization. Each employee's salary stays in the currency they are paid in."
      />

      <FilterBar>
        <ReportingCurrencySelect
          value={baseCurrency}
          options={currencies}
          onChange={setBaseCurrency}
        />
        <FilterSelect
          label="Country"
          value={country}
          options={filters.countries}
          onChange={setCountry}
        />
        <FilterSelect
          label="Department"
          value={department}
          options={filters.departments}
          onChange={setDepartment}
        />
      </FilterBar>

      <ActiveFilterReadout
        filters={[
          ...(country ? [{ label: `Country: ${country}`, onRemove: () => setCountry("") }] : []),
          ...(department ? [{ label: `Department: ${department}`, onRemove: () => setDepartment("") }] : []),
        ]}
        emptyMessage={`Showing all employees. Amounts shown in ${baseCurrency}.`}
        onClearAll={country || department ? clearFilters : undefined}
      />

      {loading ? (
        <LoadingState message="Loading insights…" />
      ) : errorMessage ? (
        <ErrorState message={errorMessage} onRetry={() => setReloadKey((key) => key + 1)} />
      ) : !insights || insights.headcount === 0 ? (
        <EmptyState message="No employees match these filters." />
      ) : (
        <Box aria-live="polite" aria-atomic="true">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
              gap: 2,
              mb: 1,
              alignItems: "stretch",
            }}
          >
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "auto" } }}>
              <StatCard label="Headcount" value={insights.headcount.toLocaleString()} />
              <Typography color="text.secondary" sx={{ fontSize: "0.8rem", mt: 1.5, lineHeight: 1.5 }}>
                Everyone matching your filters. People without a salary on file are counted here but
                not included in the pay charts and tables below.
              </Typography>
            </Box>
            <StatCard
              label={`Total (${insights.base_currency})`}
              value={formatAmount(insights.total, insights.base_currency)}
            />
            <StatCard
              label={`Average (${insights.base_currency})`}
              value={formatAmount(insights.average, insights.base_currency)}
            />
            <StatCard
              label={`Median (${insights.base_currency})`}
              value={formatAmount(insights.median, insights.base_currency)}
            />
          </Box>

          <Typography color="text.secondary" sx={{ fontSize: "0.85rem", mb: 3 }}>
            All amounts below are shown in {insights.base_currency}. Exchange rates updated{" "}
            {formatDate(insights.rates_as_of)}.
          </Typography>

          <Paper variant="outlined">
            <Tabs
              value={activeTab}
              onChange={(_, value: TabKey) => setActiveTab(value)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                px: { xs: 1, sm: 2 },
                borderBottom: 1,
                borderColor: "divider",
                "& .MuiTab-root": {
                  minHeight: 48,
                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                  px: { xs: 1.5, sm: 2 },
                },
              }}
            >
              <Tab label="By country" value="country" />
              <Tab label="By department" value="department" />
              <Tab label="Salary ranges" value="ranges" />
            </Tabs>

            <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
              {activeTab === "country" && (
                <Box>
                  <SalaryCostByCountryChart
                    embedded
                    reportingCurrency={insights.base_currency}
                    organizationTotal={insights.total}
                    countries={insights.by_country.map((row) => ({
                      country: row.country,
                      salaryCost: row.total,
                    }))}
                  />
                  <BreakdownTable
                    emptyMessage="No salary data for these filters."
                    columns={[
                      "Country",
                      "Headcount",
                      `Total (${insights.base_currency})`,
                      `Average (${insights.base_currency})`,
                    ]}
                    rows={insights.by_country.map((row) => ({
                      key: row.country,
                      cells: [
                        row.country,
                        row.headcount.toLocaleString(),
                        formatAmount(row.total, insights.base_currency),
                        formatAmount(row.average, insights.base_currency),
                      ],
                      alignments: ["left", "left", "right", "right"],
                    }))}
                  />
                </Box>
              )}

              {activeTab === "department" && (
                <Box>
                  <SalaryCostByDepartmentChart
                    embedded
                    reportingCurrency={insights.base_currency}
                    organizationTotal={insights.total}
                    departments={insights.by_department.map((row) => ({
                      department: row.department,
                      salaryCost: row.total,
                    }))}
                  />
                  <BreakdownTable
                    emptyMessage="No salary data for these filters."
                    columns={[
                      "Department",
                      "Headcount",
                      `Total (${insights.base_currency})`,
                      `Average (${insights.base_currency})`,
                    ]}
                    rows={insights.by_department.map((row) => ({
                      key: row.department,
                      cells: [
                        row.department,
                        row.headcount.toLocaleString(),
                        formatAmount(row.total, insights.base_currency),
                        formatAmount(row.average, insights.base_currency),
                      ],
                      alignments: ["left", "left", "right", "right"],
                    }))}
                  />
                </Box>
              )}

              {activeTab === "ranges" && (
                <SalaryRangesPanel
                  distribution={insights.distribution}
                  baseCurrency={insights.base_currency}
                />
              )}
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
}

function BreakdownTable({
  columns,
  rows,
  emptyMessage,
}: {
  columns: string[];
  rows: Array<{
    key: string;
    cells: Array<string | ReactNode>;
    alignments?: Array<"left" | "right" | "center">;
  }>;
  emptyMessage: string;
}) {
  if (rows.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <TableContainer sx={{ overflowX: "auto" }}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column}>{column}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.key} hover>
              {row.cells.map((cell, index) => (
                <TableCell
                  key={`${row.key}-${index}`}
                  align={row.alignments?.[index] ?? "left"}
                  sx={
                    row.alignments?.[index] === "right"
                      ? { fontVariantNumeric: "tabular-nums", fontWeight: index >= 2 ? 600 : 400 }
                      : undefined
                  }
                >
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function SalaryRangesPanel({
  distribution,
  baseCurrency,
}: {
  distribution: Insights["distribution"];
  baseCurrency: string;
}) {
  const totalHeadcount = distribution.reduce((sum, row) => sum + row.headcount, 0);
  const dominantBucket = distribution.reduce(
    (max, row) => (row.headcount > max.headcount ? row : max),
    distribution[0] ?? { bucket: "", headcount: 0 },
  );
  const showDominantNote =
    totalHeadcount > 0 && dominantBucket.headcount / totalHeadcount > 0.9;

  if (distribution.length === 0) {
    return <EmptyState message="No salary range data for these filters." />;
  }

  return (
    <Box>
      <Typography color="text.secondary" sx={{ fontSize: "0.875rem", mb: 2 }}>
        How many employees fall in each salary band. Band amounts are shown in {baseCurrency}.
      </Typography>

      {showDominantNote ? (
        <Typography color="text.secondary" sx={{ fontSize: "0.875rem", mb: 2 }}>
          Most employees sit in one band — the fixed bands may not reflect typical pay levels in{" "}
          {baseCurrency}.
        </Typography>
      ) : null}

      <SalaryRangeDistributionChart embedded baseCurrency={baseCurrency} distribution={distribution} />

      <TableContainer sx={{ overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Range ({baseCurrency})</TableCell>
              <TableCell align="right">Headcount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {distribution.map((row) => (
              <TableRow key={row.bucket} hover>
                <TableCell>{row.bucket}</TableCell>
                <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                  {row.headcount.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
