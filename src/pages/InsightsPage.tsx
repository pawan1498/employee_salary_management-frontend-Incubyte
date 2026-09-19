import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
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
import { getInsights } from "../api/insights";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { FilterBar } from "../components/FilterBar";
import { FilterSelect } from "../components/FilterSelect";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { COUNTRIES, DEPARTMENTS } from "../constants/filters";
import { formatAmount } from "../format";
import type { DistributionBucket, Insights } from "../types/insights";

type TabKey = "currency" | "country" | "department" | "ranges";

export function InsightsPage() {
  const [country, setCountry] = useState("");
  const [department, setDepartment] = useState("");
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [activeTab, setActiveTab] = useState<TabKey>("currency");
  const [rangeCurrency, setRangeCurrency] = useState("");

  const hasActiveFilters = country !== "" || department !== "";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(false);

      try {
        const result = await getInsights({ country, department });
        if (!cancelled) {
          setInsights(result.data);
        }
      } catch {
        if (!cancelled) {
          setInsights(null);
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [country, department, reloadKey]);

  const distributionCurrencies = useMemo(() => {
    if (!insights) {
      return [];
    }
    return [...new Set(insights.distribution.map((row) => row.currency))];
  }, [insights]);

  useEffect(() => {
    if (distributionCurrencies.length === 0) {
      setRangeCurrency("");
      return;
    }
    if (!distributionCurrencies.includes(rangeCurrency)) {
      setRangeCurrency(distributionCurrencies[0]);
    }
  }, [distributionCurrencies, rangeCurrency]);

  function clearFilters() {
    setCountry("");
    setDepartment("");
  }

  return (
    <Box>
      <PageHeader
        title="Insights"
        subtitle="Compensation totals from current salary data. Amounts stay in their native currency — nothing here is converted or added together across currencies."
      />

      <FilterBar>
        <FilterSelect label="Country" value={country} options={COUNTRIES} onChange={setCountry} />
        <FilterSelect
          label="Department"
          value={department}
          options={DEPARTMENTS}
          onChange={setDepartment}
        />
      </FilterBar>

      <ActiveFilterReadout
        country={country}
        department={department}
        hasActiveFilters={hasActiveFilters}
        onClearCountry={() => setCountry("")}
        onClearDepartment={() => setDepartment("")}
        onClearAll={clearFilters}
      />

      {loading ? (
        <LoadingState message="Loading insights…" />
      ) : error ? (
        <ErrorState
          message="Unable to load insights."
          onRetry={() => setReloadKey((key) => key + 1)}
        />
      ) : !insights || insights.headcount === 0 ? (
        <EmptyState message="No employees match these filters." />
      ) : (
        <Box aria-live="polite" aria-atomic="true">
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              mb: 1,
              alignItems: "stretch",
            }}
          >
            <Box sx={{ flex: "0 1 220px" }}>
              <StatCard label="Headcount" value={insights.headcount.toLocaleString()} />
              <Typography color="text.secondary" sx={{ fontSize: "0.8rem", mt: 1.5, lineHeight: 1.5 }}>
                Employees matching the filters above. Employees with no current salary on file are
                counted here but left out of the breakdowns below.
              </Typography>
            </Box>
            <CurrencyTotalsPanel rows={insights.by_currency} />
          </Box>

          <Typography color="text.secondary" sx={{ fontSize: "0.85rem", mb: 3 }}>
            Shown separately — currencies are never combined into one total.
          </Typography>

          <Paper variant="outlined">
            <Tabs
              value={activeTab}
              onChange={(_, value: TabKey) => setActiveTab(value)}
              sx={{ px: 2, borderBottom: 1, borderColor: "divider" }}
            >
              <Tab label="By currency" value="currency" />
              <Tab label="By country" value="country" />
              <Tab label="By department" value="department" />
              <Tab label="Salary ranges" value="ranges" />
            </Tabs>

            <Box sx={{ p: 2.5 }}>
              {activeTab === "currency" && (
                <BreakdownTable
                  emptyMessage="No salary data for these filters."
                  columns={["Currency", "Headcount", "Total", "Average"]}
                  rows={insights.by_currency.map((row) => ({
                    key: row.currency,
                    cells: [
                      <CurrencyTag key="currency" code={row.currency} />,
                      row.headcount.toLocaleString(),
                      formatAmount(row.total, row.currency),
                      formatAmount(row.average, row.currency),
                    ],
                    alignments: ["left", "left", "right", "right"],
                  }))}
                />
              )}

              {activeTab === "country" && (
                <BreakdownTable
                  emptyMessage="No salary data for these filters."
                  columns={["Country", "Currency", "Headcount", "Total", "Average"]}
                  rows={insights.by_country.map((row) => ({
                    key: `${row.country}-${row.currency}`,
                    cells: [
                      row.country,
                      <CurrencyTag key="currency" code={row.currency} />,
                      row.headcount.toLocaleString(),
                      formatAmount(row.total, row.currency),
                      formatAmount(row.average, row.currency),
                    ],
                    alignments: ["left", "left", "left", "right", "right"],
                  }))}
                />
              )}

              {activeTab === "department" && (
                <BreakdownTable
                  emptyMessage="No salary data for these filters."
                  columns={["Department", "Currency", "Headcount", "Total", "Average"]}
                  rows={insights.by_department.map((row) => ({
                    key: `${row.department}-${row.currency}`,
                    cells: [
                      row.department,
                      <CurrencyTag key="currency" code={row.currency} />,
                      row.headcount.toLocaleString(),
                      formatAmount(row.total, row.currency),
                      formatAmount(row.average, row.currency),
                    ],
                    alignments: ["left", "left", "left", "right", "right"],
                  }))}
                />
              )}

              {activeTab === "ranges" && (
                <SalaryRangesPanel
                  distribution={insights.distribution}
                  currencies={distributionCurrencies}
                  selectedCurrency={rangeCurrency}
                  onCurrencyChange={setRangeCurrency}
                />
              )}
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
}

function ActiveFilterReadout({
  country,
  department,
  hasActiveFilters,
  onClearCountry,
  onClearDepartment,
  onClearAll,
}: {
  country: string;
  department: string;
  hasActiveFilters: boolean;
  onClearCountry: () => void;
  onClearDepartment: () => void;
  onClearAll: () => void;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        flexWrap: "wrap",
        mb: 3,
        minHeight: 32,
      }}
    >
      {!hasActiveFilters ? (
        <Typography color="text.secondary" sx={{ fontSize: "0.875rem" }}>
          Showing all countries and departments.
        </Typography>
      ) : (
        <>
          {country ? (
            <Chip label={`Country: ${country}`} size="small" onDelete={onClearCountry} />
          ) : null}
          {department ? (
            <Chip label={`Department: ${department}`} size="small" onDelete={onClearDepartment} />
          ) : null}
          <Link
            component="button"
            type="button"
            onClick={onClearAll}
            sx={{ fontSize: "0.875rem", ml: 0.5 }}
          >
            Clear filters
          </Link>
        </>
      )}
    </Box>
  );
}

function CurrencyTotalsPanel({
  rows,
}: {
  rows: Insights["by_currency"];
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        flex: "1 1 320px",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      <Typography
        sx={{
          fontSize: "0.72rem",
          fontWeight: 700,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          color: "text.secondary",
        }}
      >
        Totals by currency
      </Typography>
      {rows.length === 0 ? (
        <Typography color="text.secondary" sx={{ fontSize: "0.875rem" }}>
          No salary data for these filters.
        </Typography>
      ) : (
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          {rows.map((row) => (
            <Box
              key={row.currency}
              sx={{
                px: 2,
                py: 1.25,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                bgcolor: "background.paper",
                minWidth: 140,
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "text.secondary",
                  letterSpacing: "0.04em",
                }}
              >
                {row.currency}
              </Typography>
              <Typography sx={{ fontWeight: 650, mt: 0.25, fontVariantNumeric: "tabular-nums" }}>
                {formatAmount(row.total, row.currency)}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
}

function CurrencyTag({ code }: { code: string }) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        px: 1,
        py: 0.25,
        borderRadius: 1,
        bgcolor: "grey.100",
        fontSize: "0.8rem",
        fontWeight: 600,
        letterSpacing: "0.03em",
      }}
    >
      {code}
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
  currencies,
  selectedCurrency,
  onCurrencyChange,
}: {
  distribution: DistributionBucket[];
  currencies: string[];
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
}) {
  const rows = distribution.filter((row) => row.currency === selectedCurrency);
  const totalHeadcount = rows.reduce((sum, row) => sum + row.headcount, 0);
  const dominantBucket = rows.reduce(
    (max, row) => (row.headcount > max.headcount ? row : max),
    rows[0] ?? { bucket: "", headcount: 0 },
  );
  const showDominantNote =
    totalHeadcount > 0 && dominantBucket.headcount / totalHeadcount > 0.9;

  if (currencies.length === 0) {
    return <EmptyState message="No salary range data for these filters." />;
  }

  return (
    <Box>
      <Typography color="text.secondary" sx={{ fontSize: "0.875rem", mb: 2 }}>
        How many employees fall into fixed salary ranges, shown one currency at a time. Ranges use
        each currency&apos;s native amounts — they are not converted or combined.
      </Typography>

      <FormControl size="small" sx={{ minWidth: 160, mb: 2 }}>
        <InputLabel id="range-currency-label">Currency</InputLabel>
        <Select
          labelId="range-currency-label"
          label="Currency"
          value={selectedCurrency}
          onChange={(event) => onCurrencyChange(event.target.value)}
        >
          {currencies.map((currency) => (
            <MenuItem key={currency} value={currency}>
              {currency}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {rows.length === 0 ? (
        <EmptyState message={`No salary range data for ${selectedCurrency}.`} />
      ) : (
        <>
          {showDominantNote ? (
            <Typography color="text.secondary" sx={{ fontSize: "0.875rem", mb: 2 }}>
              Most employees fall in one range — fixed absolute ranges may not reflect typical
              salaries in {selectedCurrency}.
            </Typography>
          ) : null}
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Range</TableCell>
                  <TableCell align="right">Headcount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={`${row.currency}-${row.bucket}`} hover>
                    <TableCell>{row.bucket}</TableCell>
                    <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                      {row.headcount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
}
