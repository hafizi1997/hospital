# HospitalRun Platform — Claude Code Guide

## Project Overview

Hospital management system. Full-stack: React 19 SPA talking to a Laravel 13 REST API, routed through a Caddy reverse proxy. All requests from the frontend go to `/api/*` — same origin, no CORS.

**Stack at a glance:**
- Frontend: React 19 + TypeScript 6 + Vite + Tailwind 4 + shadcn/ui
- Backend: Laravel 13 (PHP 8.3) + Sanctum (auth) + Spatie Permission (RBAC)
- DB: MySQL 8.0 | Cache/Session/Queue: Redis 7
- Infra: Docker Compose + Caddy reverse proxy

---

## Running the Project

```bash
# Start everything
docker compose up --build

# App is at http://localhost
# API is at http://localhost/api
```

---

## Backend Architecture

### The only rule that matters: thin controllers

Every controller action does exactly three things:
1. Receive the request (validation handled by a FormRequest)
2. Call a Service method
3. Return an API Resource

```php
// Good
public function store(StorePatientRequest $request, PatientService $service): PatientResource
{
    return new PatientResource($service->create($request->validated()));
}

// Bad — validation in controller, raw array response, business logic inline
public function store(Request $request)
{
    $request->validate([...]);
    $patient = Patient::create([...]);
    // 30 more lines of logic
    return response()->json($patient);
}
```

### Folder structure

```
backend/app/
├── Http/
│   ├── Controllers/Api/     # one controller per resource, thin
│   ├── Requests/            # StoreXxxRequest, UpdateXxxRequest — validation here
│   └── Resources/           # XxxResource, XxxCollection — JSON shape here
├── Models/                  # Eloquent relations, scopes, casts — no business logic
├── Services/                # all business logic lives here
└── Policies/                # authorization per model (used with Spatie roles)
```

### Routes

All API routes are versioned under `/api/v1` and protected by `auth:sanctum` except auth endpoints.

```php
// routes/api.php
Route::prefix('v1')->group(function () {
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/register', [AuthController::class, 'register']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::apiResource('patients', PatientController::class);
        Route::apiResource('doctors', DoctorController::class);
        Route::apiResource('appointments', AppointmentController::class);
    });
});
```

### API Resource shape

Every response goes through a Resource — never return raw models or raw arrays.

```php
// app/Http/Resources/PatientResource.php
public function toArray(Request $request): array
{
    return [
        'id'         => $this->id,
        'name'       => $this->name,
        'created_at' => $this->created_at->toISOString(),
    ];
}
```

### FormRequest validation

```php
// app/Http/Requests/StorePatientRequest.php
public function rules(): array
{
    return [
        'name'  => ['required', 'string', 'max:255'],
        'email' => ['required', 'email', 'unique:patients'],
    ];
}
```

### Service layer

```php
// app/Services/PatientService.php
class PatientService
{
    public function create(array $data): Patient
    {
        return Patient::create($data);
    }
}
```

### What NOT to do (backend)

- Do not put validation inside controller methods — use FormRequests
- Do not return `response()->json($model)` — always use API Resources
- Do not write business logic in Models or Controllers — use Services
- Do not skip Policies for authorization — use `$this->authorize()` in controllers
- Do not add routes outside the `v1` prefix group

---

## Frontend Architecture

### Feature-based structure (vertical slices)

Group by feature, not by file type. Every feature owns its API hooks, components, pages, schemas, and types.

```
frontend/src/
├── components/
│   ├── ui/              # shadcn/ui primitives only — do not modify these
│   └── shared/          # cross-feature reusable components (DataTable, PageHeader, etc.)
├── features/
│   ├── auth/
│   │   ├── api/         # useLogin, useLogout React Query hooks
│   │   ├── components/  # LoginForm, etc.
│   │   ├── pages/       # LoginPage
│   │   ├── schemas/     # loginSchema (Zod)
│   │   └── types.ts
│   ├── patients/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── schemas/
│   │   └── types.ts
│   ├── appointments/
│   └── doctors/
├── hooks/               # shared hooks used across multiple features
├── lib/
│   ├── api.ts           # Axios instance — import this, never create new axios instances
│   └── utils.ts         # cn() and other helpers
├── store/               # Zustand stores (authStore, uiStore)
├── types/               # global TypeScript types
└── App.tsx              # router setup only — no component logic here
```

### State management rules

| What | Tool | Why |
|---|---|---|
| Server data (API responses) | React Query (`@tanstack/react-query`) | caching, refetch, loading/error states |
| Auth state (token, user) | Zustand (`store/authStore.ts`) | persisted client state |
| UI state (modals, sidebar) | Zustand (`store/uiStore.ts`) | shared UI state |
| Form state | React Hook Form | form-specific, not global |

Never use `useState` + `useEffect` to fetch data — always use React Query.

```tsx
// Good
const { data: patients, isLoading } = usePatients()

// Bad
const [patients, setPatients] = useState([])
useEffect(() => { api.get('/patients').then(...) }, [])
```

### API hooks pattern (React Query)

Put all API hooks inside the feature's `api/` folder.

```tsx
// features/patients/api/usePatients.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Patient } from '../types'

export function usePatients() {
    return useQuery({
        queryKey: ['patients'],
        queryFn: () => api.get<Patient[]>('/v1/patients').then(r => r.data),
    })
}

// features/patients/api/useCreatePatient.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useCreatePatient() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: CreatePatientInput) =>
            api.post('/v1/patients', data).then(r => r.data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patients'] }),
    })
}
```

### Form pattern (React Hook Form + Zod)

Schema in `schemas/`, hook in the component, resolver bridges them.

```tsx
// features/patients/schemas/patientSchema.ts
import { z } from 'zod'

export const patientSchema = z.object({
    name:  z.string().min(1),
    email: z.string().email(),
})
export type PatientFormValues = z.infer<typeof patientSchema>
```

```tsx
// features/patients/components/PatientForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { patientSchema, type PatientFormValues } from '../schemas/patientSchema'

export function PatientForm() {
    const form = useForm<PatientFormValues>({ resolver: zodResolver(patientSchema) })
    // ...
}
```

### UI components

- Use `components/ui/` (shadcn) for all base elements — Button, Input, Dialog, Table, etc.
- Use `lucide-react` for all icons
- Use `sonner` for toast notifications
- Use `date-fns` for all date formatting
- Use `recharts` for charts/graphs
- Use `@tanstack/react-table` for data tables via the shared `DataTable` component

### Routing

React Router v7. Route definitions live in `App.tsx`. Page components live in `features/<name>/pages/`.

```tsx
// App.tsx — router only, no UI here
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route element={<ProtectedLayout />}>
    <Route path="/" element={<DashboardPage />} />
    <Route path="/patients" element={<PatientsPage />} />
    <Route path="/patients/:id" element={<PatientDetailPage />} />
  </Route>
</Routes>
```

### TypeScript rules

- Always type API responses — define the type in `features/<name>/types.ts`
- Never use `any` — use `unknown` and narrow it
- Prefer `type` over `interface` for data shapes
- The Axios instance in `lib/api.ts` already sets `Accept: application/json` — don't override headers per-call unless necessary

### What NOT to do (frontend)

- Do not fetch data with `useState` + `useEffect` — use React Query
- Do not create new `axios` instances — always import from `@/lib/api`
- Do not put page-level components in `components/` — they go in `features/<name>/pages/`
- Do not put shadcn/ui components in `components/shared/` — they live in `components/ui/`
- Do not use `any` type
- Do not add business logic to pages — pages compose features, services hold logic
- Do not write inline styles — use Tailwind utility classes

---

## Authentication Flow

- Backend: Sanctum token auth. `POST /api/v1/auth/login` returns a bearer token.
- Frontend: Store token in `authStore` (Zustand). Attach it via Axios request interceptor in `lib/api.ts`.
- Protected routes: Wrap in a `ProtectedLayout` component that reads from `authStore`.

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| React components | PascalCase | `PatientForm.tsx` |
| React hooks | camelCase prefixed `use` | `usePatients.ts` |
| Zod schemas | camelCase + `Schema` suffix | `patientSchema` |
| Laravel controllers | PascalCase + `Controller` | `PatientController.php` |
| Laravel requests | `Store/Update` + Model + `Request` | `StorePatientRequest.php` |
| Laravel resources | Model + `Resource/Collection` | `PatientResource.php` |
| Laravel services | Model + `Service` | `PatientService.php` |
| API routes | kebab-case plural | `/api/v1/patients` |
| Database tables | snake_case plural | `patients`, `appointment_slots` |

---

## Key Dependencies Reference

**Frontend**
- `@tanstack/react-query` — server state, data fetching
- `zustand` — client state
- `react-hook-form` + `@hookform/resolvers` — forms
- `zod` — schema validation
- `axios` — HTTP client
- `react-router-dom` v7 — routing
- `shadcn` / `radix-ui` — UI primitives
- `lucide-react` — icons
- `sonner` — toasts
- `recharts` — charts
- `@tanstack/react-table` — tables
- `date-fns` — date utilities
- `motion` — animations
- `tailwind-merge` + `clsx` + `class-variance-authority` — Tailwind utilities

**Backend**
- `laravel/sanctum` — API token authentication
- `spatie/laravel-permission` — roles and permissions (RBAC)
- `laravel/pint` — code formatter (run: `./vendor/bin/pint`)
- `barryvdh/laravel-ide-helper` — IDE type hints
