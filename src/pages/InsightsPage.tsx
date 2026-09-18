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
  TextField,
  Typography,
} from "@mui/material";
import { getInsights } from "../api/insights";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
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
          country: country.trim(),
          department: department.trim(),
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
      <Typography variant="h4" sx={{ mb: 3 }}>
        Insights
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          label="Country"
          size="small"
          value={country}
          onChange={(event) => setCountry(event.target.value)}
          sx={{ minWidth: 180 }}
        />
        <TextField
          label="Department"
          size="small"
          value={department}
          onChange={(event) => setDepartment(event.target.value)}
          sx={{ minWidth: 180 }}
        />
      </Box>

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
          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Typography color="text.secondary">Headcount</Typography>
            <Typography variant="h4" sx={{ mt: 0.5 }}>
              {insights.headcount}
            </Typography>
          </Paper>

          <BreakdownTable
            title="By currency"
            columns={["Currency", "Headcount", "Total", "Average"]}
            rows={insights.by_currency.map((row) => [
              row.currency,
              row.headcount,
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
              row.headcount,
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
              row.headcount,
              formatMoney(row.total, row.currency),
              formatMoney(row.average, row.currency),
            ])}
          />

          <BreakdownTable
            title="Distribution"
            columns={["Currency", "Bucket", "Headcount"]}
            rows={insights.distribution.map((row) => [row.currency, row.bucket, row.headcount])}
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
      <Typography variant="h5" sx={{ mb: 1.5 }}>
        {title}
      </Typography>
      {rows.length === 0 ? (
        <EmptyState message="No salary data." />
      ) : (
        <TableContainer component={Paper} variant="outlined">
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
                <TableRow key={`${title}-${index}`}>
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
