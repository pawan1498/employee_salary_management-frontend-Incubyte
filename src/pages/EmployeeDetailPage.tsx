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
import { LoadingState } from "../components/LoadingState";
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
  } else if (!/^[A-Z]{3}$/.test(values.currency)) {
    errors.currency = "Currency must be 3 uppercase letters.";
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
      setCurrency("");
      setEffectiveDate("");
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
        <Link component={RouterLink} to="/employees">
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
      <Link component={RouterLink} to="/employees" sx={{ display: "inline-block", mb: 2 }}>
        Back to employees
      </Link>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {employee.name}
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Employee Information
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "200px 1fr",
            rowGap: 1.5,
            columnGap: 2,
          }}
        >
          <Typography color="text.secondary">Name</Typography>
          <Typography>{employee.name}</Typography>
          <Typography color="text.secondary">Employee Number</Typography>
          <Typography>{employee.employee_number}</Typography>
          <Typography color="text.secondary">Country</Typography>
          <Typography>{employee.country}</Typography>
          <Typography color="text.secondary">Department</Typography>
          <Typography>{employee.department}</Typography>
          <Typography color="text.secondary">Role</Typography>
          <Typography>{employee.role}</Typography>
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Current Salary
        </Typography>
        {employee.current_salary ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "200px 1fr",
              rowGap: 1.5,
              columnGap: 2,
            }}
          >
            <Typography color="text.secondary">Amount</Typography>
            <Typography>
              {formatAmount(employee.current_salary.amount, employee.current_salary.currency)}
            </Typography>
            <Typography color="text.secondary">Currency</Typography>
            <Typography>{employee.current_salary.currency}</Typography>
            <Typography color="text.secondary">Effective Date</Typography>
            <Typography>{formatDate(employee.current_salary.effective_date)}</Typography>
          </Box>
        ) : (
          <Typography color="text.secondary">No salary record</Typography>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Salary History
        </Typography>
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
                  <TableRow key={record.id}>
                    <TableCell>{formatDate(record.effective_date)}</TableCell>
                    <TableCell>{formatAmount(record.amount, record.currency)}</TableCell>
                    <TableCell>{record.currency}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Add Salary
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
          <TextField
            label="Currency"
            size="small"
            value={currency}
            onChange={(event) => setCurrency(event.target.value.toUpperCase())}
            error={Boolean(formErrors.currency)}
            helperText={formErrors.currency}
            slotProps={{ htmlInput: { maxLength: 3 } }}
          />
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
      </Paper>
    </Box>
  );
}
