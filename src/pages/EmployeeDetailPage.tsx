import { useEffect, useState, type FormEvent } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Link,
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
import { ApiError } from "../api/api";
import { createSalaryRecord, getEmployee } from "../api/employees";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { FilterBar } from "../components/FilterBar";
import { LoadingState } from "../components/LoadingState";
import { NativeCurrencyNote } from "../components/NativeCurrencyNote";
import { ReportingCurrencySelect } from "../components/ReportingCurrencySelect";
import { SalaryAmountDisplay } from "../components/SalaryAmountDisplay";
import { useBaseCurrency } from "../hooks/useBaseCurrency";
import { useExchangeRates } from "../hooks/useExchangeRates";
import {
  DetailGrid,
  DetailLabel,
  DetailValue,
  SectionCard,
} from "../components/SectionCard";
import { useFilters } from "../hooks/useFilters";
import { formatDate } from "../format";
import type { EmployeeDetail } from "../types/employee";

type FormErrors = {
  amount?: string;
  currency?: string;
  effective_date?: string;
};

function validateSalaryForm(
  values: {
    amount: string;
    currency: string;
    effective_date: string;
  },
  allowedCurrencies: string[],
): FormErrors {
  const errors: FormErrors = {};

  if (!values.amount.trim()) {
    errors.amount = "Amount is required.";
  } else if (Number.isNaN(Number(values.amount)) || Number(values.amount) <= 0) {
    errors.amount = "Amount must be greater than zero.";
  }

  if (!values.currency.trim()) {
    errors.currency = "Currency is required.";
  } else if (!allowedCurrencies.includes(values.currency)) {
    errors.currency = `Currency must be one of: ${allowedCurrencies.join(", ")}.`;
  }

  if (!values.effective_date) {
    errors.effective_date = "Effective date is required.";
  }

  return errors;
}

export function EmployeeDetailPage() {
  const { filters, loading: filtersLoading, error: filtersError } = useFilters();
  const { baseCurrency, setBaseCurrency, currencies } = useBaseCurrency(filters);
  const { rates: exchangeRates, loading: ratesLoading, error: ratesError, retry: retryRates } =
    useExchangeRates(baseCurrency);
  const { id } = useParams();
  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<"not-found" | "load" | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("not-found");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const result = await getEmployee(id as string);
        if (!cancelled) {
          applyEmployee(result.data);
        }
      } catch (err) {
        if (!cancelled) {
          setEmployee(null);
          setError(err instanceof ApiError && err.status === 404 ? "not-found" : "load");
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
  }, [id, reloadKey]);

  useEffect(() => {
    if (!employee || currency || currencies.length === 0) {
      return;
    }

    const preferred = employee.current_salary?.currency;
    if (preferred && currencies.includes(preferred)) {
      setCurrency(preferred);
      return;
    }

    setCurrency(currencies[0]);
  }, [employee, currency, currencies]);

  function applyEmployee(data: EmployeeDetail) {
    setEmployee(data);
    setCurrency((current) => {
      if (current) {
        return current;
      }
      const preferred = data.current_salary?.currency;
      if (preferred && currencies.includes(preferred)) {
        return preferred;
      }
      return currencies[0] ?? "";
    });
  }

  async function refreshEmployee() {
    if (!id) {
      return;
    }

    setRefreshing(true);
    try {
      const result = await getEmployee(id);
      applyEmployee(result.data);
      setCurrency("");
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setError("not-found");
      } else {
        setApiErrors(["Unable to refresh employee after saving."]);
      }
    } finally {
      setRefreshing(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id) {
      return;
    }

    const values = {
      amount: amount.trim(),
      currency: currency.trim(),
      effective_date: effectiveDate,
    };
    const nextErrors = validateSalaryForm(values, currencies);
    setFormErrors(nextErrors);
    setApiErrors([]);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      await createSalaryRecord(id, values);
      setAmount("");
      setEffectiveDate("");
      setApiErrors([]);
      await refreshEmployee();
    } catch (err) {
      if (err instanceof ApiError) {
        setApiErrors(err.errors);
      } else {
        setApiErrors(["Unable to save salary record."]);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || filtersLoading) {
    return <LoadingState message="Loading employee…" />;
  }

  if (filtersError || !filters) {
    return <ErrorState message="Unable to load filter options." />;
  }

  if (error === "not-found") {
    return (
      <Box>
        <ErrorState message="Employee not found." />
        <Link component={RouterLink} to="/employees" sx={{ display: "inline-block", mt: 2 }}>
          Back to employees
        </Link>
      </Box>
    );
  }

  if (error || !employee) {
    return (
      <ErrorState
        message="Unable to load employee."
        onRetry={() => setReloadKey((key) => key + 1)}
      />
    );
  }

  return (
    <Box>
      <Link
        component={RouterLink}
        to="/employees"
        sx={{ display: "inline-block", mb: 2, fontSize: "0.875rem" }}
      >
        ← Back to employees
      </Link>

      <Typography variant="h4" sx={{ mb: 0.5, fontSize: { xs: "1.5rem", sm: "1.75rem" } }}>
        {employee.name}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 1 }}>
        {employee.employee_number} · {employee.role} · {employee.department}
      </Typography>
      <NativeCurrencyNote baseCurrency={baseCurrency} ratesAsOf={exchangeRates?.rates_as_of} />

      <FilterBar>
        <ReportingCurrencySelect
          value={baseCurrency}
          options={currencies}
          onChange={setBaseCurrency}
        />
      </FilterBar>

      {ratesError ? (
        <Box sx={{ mb: 3 }}>
          <ErrorState message={ratesError} onRetry={retryRates} />
        </Box>
      ) : null}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          gap: 3,
          mb: 3,
        }}
      >
        <SectionCard title="Employee Information">
          <DetailGrid>
            <DetailLabel>Name</DetailLabel>
            <DetailValue>{employee.name}</DetailValue>
            <DetailLabel>Employee Number</DetailLabel>
            <DetailValue>{employee.employee_number}</DetailValue>
            <DetailLabel>Country</DetailLabel>
            <DetailValue>{employee.country}</DetailValue>
            <DetailLabel>Department</DetailLabel>
            <DetailValue>{employee.department}</DetailValue>
            <DetailLabel>Role</DetailLabel>
            <DetailValue>{employee.role}</DetailValue>
          </DetailGrid>
        </SectionCard>

        <Paper
          variant="outlined"
          sx={{
            p: 3,
            borderLeft: "4px solid",
            borderLeftColor: employee.current_salary ? "success.main" : "divider",
            background: employee.current_salary
              ? "linear-gradient(135deg, rgba(5, 150, 105, 0.06) 0%, rgba(255, 255, 255, 1) 60%)"
              : undefined,
            opacity: refreshing ? 0.6 : 1,
            transition: "opacity 0.15s ease",
          }}
        >
          <Typography variant="h5" sx={{ mb: 2 }}>
            Current salary
            {refreshing ? (
              <Typography component="span" color="text.secondary" sx={{ fontSize: "0.85rem", ml: 1 }}>
                Updating…
              </Typography>
            ) : null}
          </Typography>
          {employee.current_salary ? (
            <>
              <DetailGrid>
                <DetailLabel>Salary</DetailLabel>
                <DetailValue>
                  {ratesLoading ? (
                    "Loading…"
                  ) : (
                    <SalaryAmountDisplay
                      variant="base"
                      amount={employee.current_salary.amount}
                      currency={employee.current_salary.currency}
                      baseCurrency={baseCurrency}
                      rates={exchangeRates?.rates ?? null}
                      align="left"
                    />
                  )}
                </DetailValue>
                <DetailLabel>In {baseCurrency}</DetailLabel>
                <DetailValue>
                  {ratesLoading ? (
                    "Loading…"
                  ) : (
                    <SalaryAmountDisplay
                      variant="approx"
                      amount={employee.current_salary.amount}
                      currency={employee.current_salary.currency}
                      baseCurrency={baseCurrency}
                      rates={exchangeRates?.rates ?? null}
                      align="left"
                    />
                  )}
                </DetailValue>
                <DetailLabel>Effective date</DetailLabel>
                <DetailValue>{formatDate(employee.current_salary.effective_date)}</DetailValue>
              </DetailGrid>
            </>
          ) : (
            <Typography color="text.secondary">No salary record</Typography>
          )}
        </Paper>
      </Box>

      <SectionCard title="Salary History">
        {employee.salary_history.length === 0 ? (
          <EmptyState message="No salary history." />
        ) : (
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Effective Date</TableCell>
                  <TableCell align="right">Salary</TableCell>
                  <TableCell align="right">In {baseCurrency || "selected currency"}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employee.salary_history.map((record) => (
                  <TableRow key={record.id} hover>
                    <TableCell>{formatDate(record.effective_date)}</TableCell>
                    <TableCell align="right">
                      <SalaryAmountDisplay
                        variant="base"
                        amount={record.amount}
                        currency={record.currency}
                        baseCurrency={baseCurrency}
                        rates={exchangeRates?.rates ?? null}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <SalaryAmountDisplay
                        variant="approx"
                        amount={record.amount}
                        currency={record.currency}
                        baseCurrency={baseCurrency}
                        rates={exchangeRates?.rates ?? null}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </SectionCard>

      <SectionCard title="Add Salary">
        <Typography color="text.secondary" sx={{ fontSize: "0.85rem", mb: 2 }}>
          Select the currency this salary is paid in. {currencies.length} currencies are supported.
        </Typography>
        {apiErrors.length > 0 ? (
          <Box sx={{ mb: 2 }}>
            {apiErrors.map((message) => (
              <Typography key={message} color="error">
                {message}
              </Typography>
            ))}
          </Box>
        ) : null}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "flex-start",
            "& > *": { flex: { xs: "1 1 100%", sm: "0 1 auto" }, minWidth: { xs: 0, sm: "auto" } },
          }}
        >
          <TextField
            label="Amount"
            size="small"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            error={Boolean(formErrors.amount)}
            helperText={formErrors.amount}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          />
          <Box>
            <ReportingCurrencySelect
              label="Currency"
              value={currency || currencies[0] || ""}
              options={currencies}
              onChange={setCurrency}
              minWidth={140}
            />
            {formErrors.currency ? (
              <Typography color="error" sx={{ fontSize: "0.75rem", mt: 0.5, mx: 1.75 }}>
                {formErrors.currency}
              </Typography>
            ) : null}
          </Box>
          <TextField
            label="Effective Date"
            size="small"
            type="date"
            value={effectiveDate}
            onChange={(event) => setEffectiveDate(event.target.value)}
            error={Boolean(formErrors.effective_date)}
            helperText={formErrors.effective_date}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={submitting || refreshing}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {submitting ? "Saving…" : "Add salary"}
          </Button>
        </Box>
      </SectionCard>
    </Box>
  );
}
