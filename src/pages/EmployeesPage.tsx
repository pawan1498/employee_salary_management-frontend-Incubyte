import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
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
import { LoadingState } from "../components/LoadingState";
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
          country: country.trim(),
          department: department.trim(),
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
      <Typography variant="h4" sx={{ mb: 3 }}>
        Employees
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          label="Search"
          size="small"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          sx={{ minWidth: 220 }}
        />
        <TextField
          label="Country"
          size="small"
          value={country}
          onChange={(event) => handleFilterChange(setCountry, event.target.value)}
          sx={{ minWidth: 180 }}
        />
        <TextField
          label="Department"
          size="small"
          value={department}
          onChange={(event) => handleFilterChange(setDepartment, event.target.value)}
          sx={{ minWidth: 180 }}
        />
      </Box>

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
                  <TableCell>Current Salary</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {response.data.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <Link component={RouterLink} to={`/employees/${employee.id}`}>
                        {employee.name}
                      </Link>
                    </TableCell>
                    <TableCell>{employee.employee_number}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.country}</TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>
                      {employee.current_salary
                        ? formatMoney(
                            employee.current_salary.amount,
                            employee.current_salary.currency,
                          )
                        : "—"}
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
