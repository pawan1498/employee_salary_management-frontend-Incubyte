import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { getInsights } from "../api/insights";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { FilterBar } from "../components/FilterBar";
import { FilterSelect } from "../components/FilterSelect";
import { COUNTRIES, DEPARTMENTS } from "../constants/filters";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { formatMoney } from "../format";
import type { Insights } from "../types/insights";

export function InsightsPage() {
  const [country, setCountry] = useState("");
  const [department, setDepartment] = useState("");
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(false);

      try {
        const result = await getInsights({
          country,
          department,
        });
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

  return (
    <Box>
      <PageHeader
        title="Insights"
        subtitle="Compensation totals from the API. Amounts stay in their native currency."
      />

      <FilterBar>
        <FilterSelect
          label="Country"
          value={country}
          options={COUNTRIES}
          onChange={setCountry}
        />
        <FilterSelect
          label="Department"
          value={department}
          options={DEPARTMENTS}
          onChange={setDepartment}
        />
      </FilterBar>

      {loading ? (
        <LoadingState message="Loading insights…" />
      ) : error ? (
        <ErrorState
          message="Unable to load insights."
          onRetry={() => setReloadKey((key) => key + 1)}
        />
      ) : !insights || insights.headcount === 0 ? (
        <EmptyState message="No employees match your filters." />
      ) : (
        <>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
            <StatCard label="Headcount" value={insights.headcount.toLocaleString()} />
            {insights.by_currency.slice(0, 2).map((row) => (
              <StatCard
                key={row.currency}
                label={`Total (${row.currency})`}
                value={formatMoney(row.total, row.currency)}
              />
            ))}
          </Box>

          <BreakdownTable
            title="By currency"
            columns={["Currency", "Headcount", "Total", "Average"]}
            rows={insights.by_currency.map((row) => [
              row.currency,
              row.headcount.toLocaleString(),
              formatMoney(row.total, row.currency),
              formatMoney(row.average, row.currency),
            ])}
          />

          <BreakdownTable
            title="By country"
            columns={["Country", "Currency", "Headcount", "Total", "Average"]}
            rows={insights.by_country.map((row) => [
              row.country,
              row.currency,
              row.headcount.toLocaleString(),
              formatMoney(row.total, row.currency),
              formatMoney(row.average, row.currency),
            ])}
          />

          <BreakdownTable
            title="By department"
            columns={["Department", "Currency", "Headcount", "Total", "Average"]}
            rows={insights.by_department.map((row) => [
              row.department,
              row.currency,
              row.headcount.toLocaleString(),
              formatMoney(row.total, row.currency),
              formatMoney(row.average, row.currency),
            ])}
          />

          <BreakdownTable
            title="Distribution"
            columns={["Currency", "Bucket", "Headcount"]}
            rows={insights.distribution.map((row) => [
              row.currency,
              row.bucket,
              row.headcount.toLocaleString(),
            ])}
          />
        </>
      )}
    </Box>
  );
}

function BreakdownTable({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: string[];
  rows: Array<Array<string | number>>;
}) {
  return (
    <Box sx={{ mb: 3 }}>
      {rows.length === 0 ? (
        <>
          <Typography variant="h5" sx={{ mb: 1.5 }}>
            {title}
          </Typography>
          <EmptyState message="No salary data." />
        </>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid", borderColor: "divider" }}>
            <Typography variant="h5">{title}</Typography>
          </Box>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column}>{column}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={`${title}-${index}`} hover>
                  {row.map((cell, cellIndex) => (
                    <TableCell key={`${title}-${index}-${cellIndex}`}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
