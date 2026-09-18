import { apiFetch } from "./api";
import type {
  EmployeeDetailResponse,
  EmployeeListParams,
  EmployeeListResponse,
  SalaryRecordPayload,
  SalaryRecordResponse,
} from "../types/employee";

export function getEmployees(params: EmployeeListParams) {
  return apiFetch<EmployeeListResponse>("/api/employees", {}, params);
}

export function getEmployee(id: string) {
  return apiFetch<EmployeeDetailResponse>(`/api/employees/${id}`);
}

export function createSalaryRecord(id: string, salaryRecord: SalaryRecordPayload) {
  return apiFetch<SalaryRecordResponse>(`/api/employees/${id}/salary_records`, {
    method: "POST",
    body: JSON.stringify({ salary_record: salaryRecord }),
  });
}
