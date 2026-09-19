import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Chip,
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
import { getEmployees } from "../api/employees";
import { ActiveFilterReadout } from "../components/ActiveFilterReadout";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { FilterBar } from "../components/FilterBar";
import { FilterSelect } from "../components/FilterSelect";
import { LoadingState } from "../components/LoadingState";
import { NativeCurrencyNote } from "../components/NativeCurrencyNote";
import { PageHeader } from "../components/PageHeader";
import { Pagination } from "../components/Pagination";
import { ReportingCurrencySelect } from "../components/ReportingCurrencySelect";
import { SalaryAmountDisplay } from "../components/SalaryAmountDisplay";
import { useBaseCurrency } from "../hooks/useBaseCurrency";
import { useExchangeRates } from "../hooks/useExchangeRates";
import { useFilters } from "../hooks/useFilters";
import type { EmployeeListResponse } from "../types/employee";

const PER_PAGE = 25;

export function EmployeesPage() {
  const { filters, loading: filtersLoading, error: filtersError } = useFilters();
  const { baseCurrency, setBaseCurrency, currencies } = useBaseCurrency(filters);
  const { rates: exchangeRates, loading: ratesLoading, error: ratesError, retry: retryRates } =
    useExchangeRates(baseCurrency);
  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [response, setResponse] = useState<EmployeeListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setQ(searchInput.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    if (filtersLoading) {
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(false);

      try {
        const result = await getEmployees({
          q,
          country,
          department,
          role,
          page,
          per_page: PER_PAGE,
        });
        if (!cancelled) {
          setResponse(result);
        }
      } catch {
        if (!cancelled) {
          setResponse(null);
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
  }, [q, country, department, role, page, reloadKey, filtersLoading]);

  function handleFilterChange(setter: (value: string) => void, value: string) {
    setter(value);
    setPage(1);
  }

  function clearFilters() {
    setCountry("");
    setDepartment("");
    setRole("");
    setSearchInput("");
    setQ("");
    setPage(1);
  }

  const hasActiveFilters = country !== "" || department !== "" || role !== "" || q !== "";

  if (filtersLoading) {
    return (
      <Box>
        <PageHeader title="Employees" subtitle="Search and filter the directory." />
        <LoadingState message="Loading filters…" />
      </Box>
    );
  }

  if (filtersError || !filters) {
    return (
      <Box>
        <PageHeader title="Employees" />
        <ErrorState message="Unable to load filter options." />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Employees"
        subtitle="Search and filter the directory. Results are paginated by the API."
        action={
          response ? (
            <Chip
              label={`${response.meta.total.toLocaleString()} total`}
              variant="outlined"
              sx={{ fontWeight: 600, bgcolor: "background.paper" }}
            />
          ) : null
        }
      />

      <NativeCurrencyNote baseCurrency={baseCurrency} ratesAsOf={exchangeRates?.rates_as_of} />

      <FilterBar>
        <ReportingCurrencySelect
          value={baseCurrency}
          options={currencies}
          onChange={setBaseCurrency}
        />
        <TextField
          label="Search"
          size="small"
          placeholder="Name, number, role…"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          sx={{ minWidth: 240 }}
        />
        <FilterSelect
          label="Country"
          value={country}
          options={filters.countries}
          onChange={(value) => handleFilterChange(setCountry, value)}
        />
        <FilterSelect
          label="Department"
          value={department}
          options={filters.departments}
          onChange={(value) => handleFilterChange(setDepartment, value)}
        />
        <FilterSelect
          label="Role"
          value={role}
          options={filters.roles}
          onChange={(value) => handleFilterChange(setRole, value)}
        />
      </FilterBar>

      <ActiveFilterReadout
        filters={[
          ...(q ? [{ label: `Search: ${q}`, onRemove: () => { setSearchInput(""); setQ(""); setPage(1); } }] : []),
          ...(country ? [{ label: `Country: ${country}`, onRemove: () => { setCountry(""); setPage(1); } }] : []),
          ...(department ? [{ label: `Department: ${department}`, onRemove: () => { setDepartment(""); setPage(1); } }] : []),
          ...(role ? [{ label: `Role: ${role}`, onRemove: () => { setRole(""); setPage(1); } }] : []),
        ]}
        emptyMessage="Showing all employees."
        onClearAll={hasActiveFilters ? clearFilters : undefined}
      />

      {ratesError ? (
        <ErrorState message={ratesError} onRetry={retryRates} />
      ) : loading || ratesLoading || !baseCurrency ? (
        <LoadingState message="Loading employees…" />
      ) : error ? (
        <ErrorState
          message="Unable to load employees."
          onRetry={() => setReloadKey((key) => key + 1)}
        />
      ) : !response || response.data.length === 0 ? (
        <EmptyState message="No employees match your search." />
      ) : (
        <>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Employee Number</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Country</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell align="right">Base pay</TableCell>
                  <TableCell align="right">Approx. ({baseCurrency})</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {response.data.map((employee) => (
                  <TableRow key={employee.id} hover>
                    <TableCell>
                      <Link component={RouterLink} to={`/employees/${employee.id}`}>
                        {employee.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Typography component="span" sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                        {employee.employee_number}
                      </Typography>
                    </TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.country}</TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell align="right">
                      {employee.current_salary ? (
                        <SalaryAmountDisplay
                          variant="base"
                          amount={employee.current_salary.amount}
                          currency={employee.current_salary.currency}
                          baseCurrency={baseCurrency}
                          rates={exchangeRates?.rates ?? null}
                        />
                      ) : (
                        <Typography component="span" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {employee.current_salary ? (
                        <SalaryAmountDisplay
                          variant="approx"
                          amount={employee.current_salary.amount}
                          currency={employee.current_salary.currency}
                          baseCurrency={baseCurrency}
                          rates={exchangeRates?.rates ?? null}
                        />
                      ) : (
                        <Typography component="span" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Pagination
            page={response.meta.page}
            perPage={response.meta.per_page}
            total={response.meta.total}
            onPageChange={setPage}
          />
        </>
      )}
    </Box>
  );
}
