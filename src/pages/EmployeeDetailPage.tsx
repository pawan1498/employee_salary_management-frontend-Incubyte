import { useEffect, useState, type FormEvent } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
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
import { LoadingState } from "../components/LoadingState";
import {
  DetailGrid,
  DetailLabel,
  DetailValue,
  SectionCard,
} from "../components/SectionCard";
import { CURRENCIES } from "../constants/filters";
import { formatAmount, formatDate } from "../format";
import type { EmployeeDetail } from "../types/employee";

type FormErrors = {
  amount?: string;
  currency?: string;
  effective_date?: string;
};

function validateSalaryForm(values: {
  amount: string;
  currency: string;
  effective_date: string;
}): FormErrors {
  const errors: FormErrors = {};

  if (!values.amount.trim()) {
    errors.amount = "Amount is required.";
  } else if (Number.isNaN(Number(values.amount)) || Number(values.amount) <= 0) {
    errors.amount = "Amount must be greater than zero.";
  }

  if (!values.currency.trim()) {
    errors.currency = "Currency is required.";
  }

  if (!values.effective_date) {
    errors.effective_date = "Effective date is required.";
  }

  return errors;
}

export function EmployeeDetailPage() {
  const { id } = useParams();
  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [loading, setLoading] = useState(true);
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
          setEmployee(result.data);
          setCurrency((current) => current || result.data.current_salary?.currency || CURRENCIES[0]);
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
    const nextErrors = validateSalaryForm(values);
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
      setCurrency("");
      setReloadKey((key) => key + 1);
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

  if (loading) {
    return <LoadingState message="Loading employee…" />;
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

      <Typography variant="h4" sx={{ mb: 0.5 }}>
        {employee.name}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {employee.employee_number} · {employee.role} · {employee.department}
      </Typography>

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
          }}
        >
          <Typography variant="h5" sx={{ mb: 2 }}>
            Current Salary
          </Typography>
          {employee.current_salary ? (
            <>
              <Typography variant="h4" sx={{ mb: 1.5 }}>
                {formatAmount(employee.current_salary.amount, employee.current_salary.currency)}
              </Typography>
              <DetailGrid>
                <DetailLabel>Currency</DetailLabel>
                <DetailValue>{employee.current_salary.currency}</DetailValue>
                <DetailLabel>Effective Date</DetailLabel>
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
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Effective Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Currency</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employee.salary_history.map((record) => (
                  <TableRow key={record.id} hover>
                    <TableCell>{formatDate(record.effective_date)}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {formatAmount(record.amount, record.currency)}
                    </TableCell>
                    <TableCell>{record.currency}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </SectionCard>

      <SectionCard title="Add Salary">
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
          sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "flex-start" }}
        >
          <TextField
            label="Amount"
            size="small"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            error={Boolean(formErrors.amount)}
            helperText={formErrors.amount}
          />
          <FormControl size="small" sx={{ minWidth: 120 }} error={Boolean(formErrors.currency)}>
            <InputLabel id="salary-currency-label">Currency</InputLabel>
            <Select
              labelId="salary-currency-label"
              label="Currency"
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              {CURRENCIES.map((code) => (
                <MenuItem key={code} value={code}>
                  {code}
                </MenuItem>
              ))}
            </Select>
            {formErrors.currency ? (
              <Typography color="error" sx={{ fontSize: "0.75rem", mt: 0.5, mx: 1.75 }}>
                {formErrors.currency}
              </Typography>
            ) : null}
          </FormControl>
          <TextField
            label="Effective Date"
            size="small"
            type="date"
            value={effectiveDate}
            onChange={(event) => setEffectiveDate(event.target.value)}
            error={Boolean(formErrors.effective_date)}
            helperText={formErrors.effective_date}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? "Saving…" : "Add salary"}
          </Button>
        </Box>
      </SectionCard>
    </Box>
  );
}
