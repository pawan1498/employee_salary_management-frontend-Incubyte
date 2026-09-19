import type { SalaryRecord } from "./salary";

export type Employee = {
  id: number;
  employee_number: string;
  name: string;
  country: string;
  department: string;
  role: string;
  current_salary: SalaryRecord | null;
};

export type EmployeeDetail = Employee & {
  salary_history: SalaryRecord[];
};

export type EmployeeListResponse = {
  data: Employee[];
  meta: {
    page: number;
    per_page: number;
    total: number;
  };
};

export type EmployeeDetailResponse = {
  data: EmployeeDetail;
};

export type EmployeeListParams = {
  q?: string;
  country?: string;
  department?: string;
  role?: string;
  page?: number;
  per_page?: number;
};

export type SalaryRecordPayload = {
  amount: string;
  currency: string;
  effective_date: string;
};

export type SalaryRecordResponse = {
  data: SalaryRecord;
};
