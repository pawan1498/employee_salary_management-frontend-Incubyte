# ACME Employee Salary Management — Frontend

React (Vite) SPA for Incubyte's **Software Craftsperson / Ruby on Rails** take-home. HR Managers use this UI to browse employees, update salaries with history, and view compensation insights.

This repo is the **thin client**. Business rules (current salary selection, FX conversion, aggregations) live in the [Rails API](https://github.com/pawan1498/employee_salary_management-Incubyte). The UI renders API data — it does not invent totals or pay logic.

## Links

| | URL |
|---|---|
| **Live app** | https://employee-salary-management-frontend-sdqh.onrender.com |
| **Backend (Rails API)** | https://github.com/pawan1498/employee_salary_management-Incubyte |
| **API (production)** | https://employee-salary-management-incubyte.onrender.com |
| **Demo video (~7 min)** | https://drive.google.com/file/d/1kYV8zlgPqGJmI1DHsXH5uRGhhhhv2kbA/view?usp=sharing |

Product scope and backend design notes: [`docs/REQUIREMENTS.md`](https://github.com/pawan1498/employee_salary_management-Incubyte/blob/main/docs/REQUIREMENTS.md) and [`docs/DESIGN.md`](https://github.com/pawan1498/employee_salary_management-Incubyte/blob/main/docs/DESIGN.md) on the backend repo. Full JSON contract: [`docs/FRONTEND.md`](https://github.com/pawan1498/employee_salary_management-Incubyte/blob/main/docs/FRONTEND.md).

---

## Product flow

**User:** HR Manager. **No login.**

```text
Insights (home)     → headcount, total, average, median, breakdowns in a reporting currency
Employees           → search, country, department, role, pagination
Employee detail     → profile, current pay, history, add salary
```

Out of scope: auth, employee delete, Excel import, client-side FX for insights totals.

---

## Stack

| Layer | Choice |
|---|---|
| Build | Vite |
| UI | React 19 + TypeScript |
| Components | MUI |
| Routing | React Router |
| Data | Native `fetch` via `src/api/`; local React state only |
| Tests | Vitest + Testing Library |
| Config | `VITE_API_URL` (e.g. `http://localhost:3000`) |

### Key files

```text
src/
  api/           api.ts, employees.ts, filters.ts, insights.ts, exchangeRates.ts
  hooks/         useFilters.ts, useBaseCurrency.ts, useExchangeRates.ts
  pages/         InsightsPage, EmployeesPage, EmployeeDetailPage
  components/    Layout, FilterBar, ReportingCurrencySelect, StatCard, insights charts
  types/         employee, filters, insights, salary
  utils/         baseCurrency.ts, convertSalary.ts
  constants/     storage.ts (localStorage key for reporting currency)
```

---

## Local development

**Terminal 1 — Rails API** ([backend repo](https://github.com/pawan1498/employee_salary_management-Incubyte))

```bash
bin/rails db:migrate
bin/rails db:seed   # optional; creates 10,000 employees
bin/rails server    # http://localhost:3000
```

**Terminal 2 — React SPA (this repo)**

```bash
cp .env.example .env   # VITE_API_URL=http://localhost:3000
npm install
npm run dev            # http://localhost:5173
```

**Tests**

```bash
npm test
```

Smoke-test the API from the shell (no CORS needed):

```bash
curl -s http://localhost:3000/api/filters -H 'Accept: application/json'
curl -s 'http://localhost:3000/api/insights?base_currency=USD' -H 'Accept: application/json'
curl -s 'http://localhost:3000/api/exchange_rates?base_currency=USD' -H 'Accept: application/json'
```

The browser sends `Origin: http://localhost:5173`; the API must allow it via CORS (`CORS_ORIGINS` on the backend).

---

## Deploy on Render

| Service | URL |
|---|---|
| React UI | https://employee-salary-management-frontend-sdqh.onrender.com |
| Rails API | https://employee-salary-management-incubyte.onrender.com |

```text
React (this repo)  →  VITE_API_URL=https://employee-salary-management-incubyte.onrender.com
Rails API          →  CORS_ORIGINS=https://employee-salary-management-frontend-sdqh.onrender.com
```

For local + production CORS on the API:

```text
CORS_ORIGINS=http://localhost:5173,https://employee-salary-management-frontend-sdqh.onrender.com
```

| Setting | Value |
|---|---|
| Build command | `npm install --include=dev && npm run build` |
| Start command (Web Service) | `npm start` |
| Publish directory (Static Site) | `dist` |
| Env | `VITE_API_URL=https://employee-salary-management-incubyte.onrender.com` |

SPA fallback: `public/_redirects` → `/* /index.html 200`

---

## Screens and routes

| Route | Purpose | API |
|---|---|---|
| `/` | Insights: headcount, total, average, **median**, charts and tables by country/department/ranges | `GET /api/filters`, `GET /api/insights` |
| `/employees` | Directory: search, filters, pagination, native + approx. reporting pay | `GET /api/filters`, `GET /api/exchange_rates`, `GET /api/employees` |
| `/employees/:id` | Identity, current pay, history, add-salary form | `GET /api/filters`, `GET /api/exchange_rates`, `GET /api/employees/:id`, `POST …/salary_records` |

Nav: **Insights** (home) and **Employees** in the app bar (`Layout.tsx`).

---

## Page flows

### Shared: filters bootstrap

1. `useFilters()` calls `GET /api/filters` once on mount.
2. While loading → loading state; on failure → error state.
3. Dropdowns include an empty **All** option; omit the query param when All is selected.

### Shared: reporting currency picker

Used on **Insights**, **Employees**, and **Employee detail**. Same `localStorage` key (`base_currency`) everywhere.

1. Resolve initial value from `localStorage` or `default_base_currency` in filters.
2. Searchable control (`ReportingCurrencySelect` — MUI Autocomplete).
3. On change → save to `localStorage` and refetch page data that depends on currency.

### Insights (`/`)

1. Load filters → reporting currency picker.
2. `GET /api/insights?base_currency=…&country=&department=`.
3. Stat cards: headcount, total, average, **median**, plus `rates_as_of`.
4. Country/department filter bar (same pattern as employees).
5. Tabbed breakdowns with charts and tables:
   - By country (`SalaryCostByCountryChart`)
   - By department (`SalaryCostByDepartmentChart`)
   - Salary ranges (`SalaryRangeDistributionChart`)
6. On `503` (FX unavailable) → error with retry. On `422` → show API errors.
7. Do **not** convert insights totals in the browser — the API owns FX math.

### Employees (`/employees`)

1. Reporting currency picker + debounced search (300 ms) + country/department/role filters.
2. `GET /api/exchange_rates?base_currency=…` for indicative per-row conversion.
3. `GET /api/employees?q=&country=&department=&role=&page=1&per_page=25`.
4. Table: employee number, name, country, department, role, **Base pay** (native), **Approx. (reporting currency)**.
5. Row links to `/employees/:id`. Pagination from `meta.page`, `meta.per_page`, `meta.total`.

### Employee detail (`/employees/:id`)

1. `GET /api/employees/:id` + exchange rates for approx. columns.
2. Identity grid, current base pay card, salary history (newest first).
3. Add-salary form → `POST /api/employees/:id/salary_records` as **FormData**.
4. On `201` → re-fetch show. On `422` → errors on form. On `404` → not-found state.

---

## API contract (summary)

Full shapes and examples: [backend `docs/FRONTEND.md`](https://github.com/pawan1498/employee_salary_management-Incubyte/blob/main/docs/FRONTEND.md).

| Endpoint | Purpose |
|---|---|
| `GET /api/filters` | Countries, departments, roles, currencies, default reporting currency |
| `GET /api/insights` | Headcount, total, average, median, breakdowns (all in `base_currency`) |
| `GET /api/exchange_rates` | Cached Frankfurter rates for per-row approx. on employee pages |
| `GET /api/employees` | Paginated list with `current_salary` |
| `GET /api/employees/:id` | Profile + current salary + history |
| `POST /api/employees/:id/salary_records` | Append salary (amount, currency, effective_date) |

Insights query params: `base_currency` (default `USD`), optional `country`, `department`.

Employee list query params: `q`, `country`, `department`, `role`, `page`, `per_page` (default 25, max 100).

---

## UX principles

- Loading, empty, and error states on every page
- Paginate; never fetch 10k rows
- Disable submit while POST is in flight
- Show 422 / 503 messages from API `errors`
- Native base pay and reporting equivalent in **separate columns** — never merged without label
- Insights retry on transient FX failure

---

## Maintenance

When a backend request spec changes the JSON shape, update [backend `docs/FRONTEND.md`](https://github.com/pawan1498/employee_salary_management-Incubyte/blob/main/docs/FRONTEND.md) and this README in the same commit so reviewers and the SPA stay aligned.
