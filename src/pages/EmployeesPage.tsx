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
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { FilterBar } from "../components/FilterBar";
import { FilterSelect } from "../components/FilterSelect";
import { COUNTRIES, DEPARTMENTS } from "../constants/filters";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { Pagination } from "../components/Pagination";
import { formatMoney } from "../format";
import type { EmployeeListResponse } from "../types/employee";

const PER_PAGE = 25;

export function EmployeesPage() {
  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [department, setDepartment] = useState("");
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
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(false);

      try {
        const result = await getEmployees({
          q,
          country,
          department,
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
  }, [q, country, department, page, reloadKey]);

  function handleFilterChange(setter: (value: string) => void, value: string) {
    setter(value);
    setPage(1);
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

      <FilterBar>
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
          options={COUNTRIES}
          onChange={(value) => handleFilterChange(setCountry, value)}
        />
        <FilterSelect
          label="Department"
          value={department}
          options={DEPARTMENTS}
          onChange={(value) => handleFilterChange(setDepartment, value)}
        />
      </FilterBar>

      {loading ? (
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
                  <TableCell align="right">Current Salary</TableCell>
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
                        <Typography component="span" sx={{ fontWeight: 600 }}>
                          {formatMoney(
                            employee.current_salary.amount,
                            employee.current_salary.currency,
                          )}
                        </Typography>
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
