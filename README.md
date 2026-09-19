# React HR app — frontend notes

The UI is a **Vite + React SPA** in this repository. It talks JSON to the Rails API. It must not invent business rules (current salary, totals, FX). If the API does not return it, the screen shows empty/missing—not a client-side guess.

Update this file whenever an API contract used by the UI changes.

## Product

**User:** HR Manager. **No login.**

```text
Insights (home)     → compensation questions in a chosen reporting currency
Employees           → search, country, department, role, pagination
Employee detail     → profile, current pay, history, add salary
```

Do not add employee delete, Excel import, or auth.

## Stack (implemented)

| Layer | Choice |
|---|---|
| Build | Vite |
| UI | React + TypeScript |
| Components | MUI |
| Routing | React Router |
| Data | Native `fetch` via `src/api/api.ts`; local React state only |
| Config | `VITE_API_URL` (e.g. `http://localhost:3000`) |

The browser treats Vite (`localhost:5173`) and Rails (`localhost:3000`) as different sites. `curl` does not. The API must allow the Vite origin via CORS (`CORS_ORIGINS`).

### Frontend repo layout (key files)

```text
src/
  api/           api.ts, employees.ts, filters.ts, insights.ts, exchangeRates.ts
  hooks/         useFilters.ts, useBaseCurrency.ts, useExchangeRates.ts
  pages/         InsightsPage, EmployeesPage, EmployeeDetailPage
  types/         employee, filters, insights, salary
  constants/     storage.ts (localStorage key for base currency)
  utils/         baseCurrency.ts, convertSalary.ts
  components/    Layout, FilterBar, ReportingCurrencySelect, SalaryAmountDisplay, states
```

## Local development

**Terminal 1 — Rails API**

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

Smoke-test from the shell (no CORS needed):

```bash
curl -s http://localhost:3000/api/filters -H 'Accept: application/json'
curl -s 'http://localhost:3000/api/insights?base_currency=USD' -H 'Accept: application/json'
curl -s 'http://localhost:3000/api/exchange_rates?base_currency=USD' -H 'Accept: application/json'
```

## Deploy on Render

**Live URLs**

| Service | URL |
|---|---|
| React UI | https://employee-salary-management-frontend-sdqh.onrender.com |
| Rails API | https://employee-salary-management-incubyte.onrender.com |

```text
React (this repo)  →  VITE_API_URL=https://employee-salary-management-incubyte.onrender.com
Rails API          →  CORS_ORIGINS=https://employee-salary-management-frontend-sdqh.onrender.com
```

To keep local dev working too, comma-separate both origins on the API:

```text
CORS_ORIGINS=http://localhost:5173,https://employee-salary-management-frontend-sdqh.onrender.com
```

**UI (this repo)**

| Setting | Value |
|---|---|
| Build command | `npm install --include=dev && npm run build` |
| Start command (Web Service) | `npm start` |
| Publish directory (Static Site) | `dist` |
| Env | `VITE_API_URL=https://employee-salary-management-incubyte.onrender.com` |

SPA fallback: `public/_redirects` → `/* /index.html 200`

## Screens and routes

| Route | Purpose | API |
|---|---|---|
| `/` | Insights: headcount, total/average, by country/department, salary ranges | `GET /api/filters`, `GET /api/insights` |
| `/employees` | Directory: search, country, department, role, pagination | `GET /api/filters`, `GET /api/exchange_rates`, `GET /api/employees` |
| `/employees/:id` | Identity, current pay, history, add-salary form | `GET /api/filters`, `GET /api/exchange_rates`, `GET /api/employees/:id`, `POST …/salary_records` |

Nav: **Insights** (home) and **Employees** in the app bar (`Layout.tsx`).

## Page flows (as implemented)

### Shared: filters bootstrap

1. `useFilters()` calls `GET /api/filters` once on mount.
2. While loading → show loading state; on failure → error state (page cannot render dropdowns).
3. Dropdowns include an empty **All** option; omit the query param when All is selected (`api.ts` skips empty strings).

### Shared: reporting currency picker

Used on **Insights**, **Employees**, and **Employee detail**. Same `localStorage` key (`base_currency`) everywhere.

1. Resolve initial value from `localStorage` or `default_base_currency` in filters.
2. Render a **searchable** reporting currency control (`ReportingCurrencySelect` — MUI Autocomplete).
3. On change → save to `localStorage` and refetch page data that depends on currency.

### Employees (`/employees`)

1. Load filters → render reporting currency picker + search box + country/department/role dropdowns.
2. `GET /api/exchange_rates?base_currency=…` for indicative per-row conversion.
3. Search input is debounced (300 ms) before setting `q` and resetting to page 1.
4. `GET /api/employees?q=&country=&department=&role=&page=1&per_page=25`.
5. Table shows employee number, name, country, department, role, **Base pay** (native), and **Approx. (reporting currency)** in separate columns.
6. Row links to `/employees/:id`. Pagination uses `meta.page`, `meta.per_page`, `meta.total`.
7. Active filters shown as chips with clear actions.

### Employee detail (`/employees/:id`)

1. Load filters (salary form + reporting currency picker) and `GET /api/employees/:id`.
2. `GET /api/exchange_rates?base_currency=…` for indicative conversion on current salary and history rows.
3. Show identity grid, current base pay card (native + approx. in separate rows), salary history table with separate Base pay / Approx. columns (newest first).
4. Add-salary form: amount, currency (`currencies` from filters — searchable), effective date.
5. Client-side validation (required fields, amount > 0) before POST.
6. `POST /api/employees/:id/salary_records` as **FormData** (`salary_record[amount]`, etc.).
7. On `201` → re-fetch show to update current salary and history.
8. On `422` → show `errors` next to the form. On `404` → not-found state.

### Insights (`/`)

1. Load filters → searchable reporting currency picker from `currencies` (shared with employee pages).
2. `GET /api/insights?base_currency=…&country=&department=` (omit empty filter params).
3. Render stat cards (headcount, total, average), `rates_as_of` note, tabbed breakdowns:
   - By country
   - By department
   - Salary ranges (`distribution` buckets)
4. Country/department filters reuse the same filter bar pattern as employees.
5. Currency change → save to `localStorage` (`base_currency` key), refetch insights.
6. On `503` (FX unavailable) → error state with retry. On `422` (bad currency) → show API errors.
7. Do **not** convert Insights totals in the browser — the API owns FX math for aggregation.

## API the UI should call (as implemented)

### Filter dropdowns — `GET /api/filters`

```json
{
  "data": {
    "countries": ["United States", "United Kingdom", "India", "Germany", "Canada"],
    "departments": ["Engineering", "People", "Finance", "Sales", "Operations"],
    "roles": ["Account Executive", "Accountant", "..."],
    "currencies": [
      "AUD", "BRL", "CAD", "CHF", "CNY", "CZK", "DKK", "EUR", "GBP",
      "HKD", "HUF", "IDR", "ILS", "INR", "ISK", "JPY", "KRW", "MXN", "MYR",
      "NOK", "NZD", "PHP", "PLN", "RON", "SEK", "SGD", "THB", "TRY", "USD", "ZAR"
    ],
    "default_base_currency": "USD"
  }
}
```

| Field | UI use |
|---|---|
| `countries`, `departments`, `roles` | Employee list search filters; insights filters |
| `currencies` | Single Frankfurter-supported list — salary form, reporting picker, and API validation |
| `default_base_currency` | Initial reporting currency when `localStorage` is empty |

One **`currencies`** list (30 Frankfurter ECB codes) drives everything: saving a salary, picking insights base currency, and exchange rates. Codes not in this list return `422`.

### Exchange rates — `GET /api/exchange_rates`

Query (optional): `base_currency` (Frankfurter ISO code; default `USD`).

Returns cached Frankfurter (ECB) rates for converting salary currencies into the requested reporting currency. Used by employee list/detail for approximate per-row equivalents. Insights aggregation still happens entirely in `GET /api/insights`.

| Status | When |
|---|---|
| `200` | Success |
| `422` | `{ "errors": ["Base currency is not supported"] }` |
| `503` | `{ "errors": ["Exchange rates are temporarily unavailable"] }` |

Conversion on employee pages: `reporting_amount = native_amount / rates[native_currency]` (same formula as Insights SQL).

### List — `GET /api/employees`

Query: `q`, `country`, `department`, `role`, `page`, `per_page` (default 25, max 100).

`current_salary` is `null` when the employee has no salary records. Amounts are always in the employee's **base pay** currency (native).

### Show — `GET /api/employees/:id`

Includes `current_salary` and `salary_history` (newest first). Current salary is the latest `effective_date`, then latest `id`.

### Create salary — `POST /api/employees/:id/salary_records`

UI sends **FormData**. Currency must be one of **`currencies`**. Amount must be **> 0**. After success, re-fetch show.

### Insights — `GET /api/insights`

Query (optional): `country`, `department`, `base_currency`.

Response includes `base_currency`, `rates_as_of`, `headcount`, `total`, `average`, `by_country`, `by_department`, `distribution`. All amounts already in `base_currency`.

- `422` — unsupported base currency
- `503` — exchange rates unavailable

## UX bar

- Loading, empty (“No employees match”), and error states on every page
- Paginate; never fetch 10k rows
- Disable submit while POST is in flight
- Show 422 / 503 messages from `errors` (via `ApiError` in `api.ts`)
- Insights retry on transient FX failure
- **Base pay** and **approximate reporting equivalent** in separate columns on employee list and history

## Out of scope for the SPA

Login, routing guards, client-side FX for **Insights totals** (server owns aggregation), optimistic overwrite of salary history, Next.js, server-side settings API for default currency (React uses `localStorage` + `default_base_currency` from filters).

## Maintenance

When a request spec changes the JSON shape, update **this file in the same commit** so reviewers and the React app stay aligned.
