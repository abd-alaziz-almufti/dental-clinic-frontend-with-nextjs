# ROADMAP — Lumina Dental Frontend

**PRD**: [`PRD_LuminaDental_Frontend.md`](./PRD_LuminaDental_Frontend.md)  
**Constitution**: [`.specify/memory/constitution.md`](./.specify/memory/constitution.md)  
**Workflow**: `phased-delivery-workflow` skill  
**Backend**: `D:\Projects\DentalClinicManagementSystem` (Laravel 13, `/api/v1/...`)  
**Design**: `D:\Projects\stitch_dentoflow_enterprise_dashboard` (Lumina Dental reference screens)

---

## Cross-Cutting Rules (apply to every phase)

Every phase spec MUST restate and comply with these cross-cutting rules from the constitution:

1. **Bilingual (en + ar)**: Every user-facing string uses `useTranslations()`. No hardcoded text.
2. **Logical CSS**: All layout spacing uses `ms-*`/`me-*`/`ps-*`/`pe-*` (Tailwind v4 logical).
3. **Error code branching**: Frontend logic branches on `error_code`, never `message` text.
4. **Centralized Axios**: All HTTP through `src/config/axios.js`. No ad-hoc fetch/axios.
5. **Role-based UI via `useAuth()`**: One shared utility — no inline role string comparisons.
6. **Paginated fetches**: All list fetches include `page` + `per_page`. No unbounded requests.
7. **Loading + empty states**: Every list view ships with skeleton and empty-state UX.
8. **Lumina Dental design tokens**: Teal-600 primary, Inter font, per PRD §7.
9. **Accessibility gate**: Every phase's UI passes WCAG 2.1 AA checklist before exit.

---

## Phase 0 — Spec Kit Constitution & Project Foundation
**Status**: ✅ COMPLETE (PRD written, constitution ratified, ROADMAP created)  
**Spec**: N/A (constitution phase — runs `/speckit-constitution` directly)  
**Goal**: Establish the Spec Kit setup, project file structure, environment, Axios config, and
i18n/locale routing scaffolding. No visible UI beyond a locale-aware "coming soon" page.

### Scope
- [x] PRD written (`PRD_LuminaDental_Frontend.md`)
- [x] Constitution ratified (`.specify/memory/constitution.md`)
- [x] ROADMAP created (`ROADMAP.md`)
- [ ] `next-intl` installed and `[locale]` App Router segment configured
- [ ] `lucide-react`, `date-fns`, `react-hook-form`, `zod` installed
- [ ] `src/config/axios.js` updated with Auth + Accept-Language interceptors
- [ ] `messages/en.json` and `messages/ar.json` created (empty stubs)
- [ ] Locale switch renders `/en/` and `/ar/` correctly with `dir` attribute
- [ ] `src/components/ui/` scaffolded (Button, Badge, Card, Spinner, Modal shell)

### Exit Criteria
- `/en/` and `/ar/` routes render correctly with correct `dir` attribute
- `axios.js` interceptors functional (token attach + 401 redirect)
- Project builds without errors (`npm run build`)

### Dependencies
- None (first phase)

---

## Phase 1 — Authentication
**Status**: ✅ COMPLETE  
**Spec**: `specs/001-authentication/`  
**Goal**: Full login/logout flow with token management, route guards, and `useAuth` hook.


### Scope
- Login page (`/[locale]/login`) — Lumina Dental branded, matches design reference
- POST `/api/v1/login` → store token in `localStorage`
- Logout → POST `/api/v1/logout` → clear token, redirect to login
- `useAuth()` hook: provides `user`, `token`, `roles`, `can()`, `login()`, `logout()`
- `AppProvider.jsx` wraps app with auth context
- `middleware.js` route guard: unauthenticated → `/[locale]/login`; auth on login → `/[locale]/dashboard`
- 401 interceptor → clear token → redirect with "session expired" param
- Login form validation (Zod): required fields, email format

### Design Reference
`stitch_dentoflow_enterprise_dashboard/` — use sidebar design for post-auth layout shell

### Exit Criteria
- Login with valid credentials → token stored → redirected to `/[locale]/dashboard`
- Login with invalid credentials → error toast with `UNAUTHENTICATED` message
- Logout → token cleared → redirected to login
- Protected routes redirect unauthenticated users
- RTL login page mirrors correctly in Arabic

### Dependencies
- Phase 0 complete
- Backend: `GET /api/v1/me` endpoint must be available (confirm or flag Risk R-06)

---

## Phase 2 — Dashboard
**Status**: ✅ Complete  
**Spec**: `specs/002-dashboard/`  
**Goal**: Role-appropriate dashboard for admin/super-admin (KPI overview) and doctor (schedule-focused).

### Scope
- Admin dashboard: KPI cards (Today's Appointments from `/api/v1/appointments?filter[date]=today`,
  Total Patients from `/api/v1/patients` meta.total, Today's Revenue placeholder, Pending Payments
  placeholder, Active Doctors placeholder)
- Quick Actions panel: "Add Patient", "Create Appointment", "New Visit" buttons (navigate only)
- Revenue bar chart: visual-only static bars (V1 — no charting library)
- Doctor dashboard: greeting (`Good morning, Dr. {name}`), Today's Schedule timeline from appointments
- Sidebar navigation shell (all pages scaffolded as stubs)
- Layout shell: fixed sidebar (264px), sticky header, main content area

### Design Reference
- `lumina_dental_dashboard/screen.png` — admin dashboard
- `lumina_dental_doctor_dashboard/screen.png` — doctor dashboard

### Exit Criteria
- Admin user sees admin dashboard with real appointment count for today
- Doctor user sees doctor dashboard with their today's schedule
- Sidebar correctly shows/hides items per role
- Dashboard renders in both EN and AR with correct RTL layout

### Dependencies
- Phase 1 complete (auth + `useAuth()`)

---

## Phase 3 — Patient Registry
**Status**: ✅ Complete  
**Spec**: `specs/003-patient-registry/`  
**Goal**: Patient list, search/filter, add patient modal, and patient profile page.

### Scope
- Patient list: paginated table, search (`?search=name/phone`), filter by assigned doctor
- Add Patient modal: form (first_name, last_name, DOB, gender, phone, email, allergies, conditions)
  → POST `/api/v1/patients`
- Patient Profile page: header, Medical Information card, Treatment Timeline (visits list),
  Files & Imaging placeholder section, Billing & Accounts summary
- Doctor role: sees only their patients (backend-enforced, no special frontend code needed)
- Patient avatar: initials-based colored circle fallback

### Design Reference
- `lumina_dental_patients_list/screen.png`
- `lumina_dental_patient_profile/screen.png`
- `lumina_dental_add_patient_form/screen.png`

### Exit Criteria
- Patient list loads with real data, search works, pagination works
- Add patient modal creates a real patient via API
- Patient profile page shows real visit history
- All three status badges (Cleared / Pending / Overdue) render correctly
- EN and AR both pass layout check

### Dependencies
- Phase 2 (layout shell, sidebar)

---

## Phase 4 — Appointments
**Status**: ✅ Complete  
**Spec**: `specs/004-appointments/`  
**Goal**: Calendar view, create appointment modal, cancel, and check-in flow.

### Scope
- Calendar: week view (default), day/month toggle, doctor filter
  - `/api/v1/appointments?filter[starts_after]=X&filter[starts_before]=Y&per_page=100`
  - Appointment cards with status badge, patient name, doctor name, time
- Create Appointment modal: patient select, doctor select, date/time picker, service note
  → POST `/api/v1/appointments`
- Cancel appointment: DELETE `/api/v1/appointments/{id}` (confirm dialog)
- Check-in button: POST `/api/v1/appointments/{id}/check-in` → navigate to `/visits/{visitId}`
- Status color coding: confirmed (blue), pending (amber), completed (green), cancelled (red),
  no_show (gray), in-chair (teal)

### Design Reference
- `lumina_dental_appointment_calendar/screen.png`
- `lumina_dental_create_appointment_form/screen.png`

### Exit Criteria
- Calendar renders real appointments for the selected week
- Create appointment saves via API and appears on calendar on refresh
- Cancel transitions appointment status (not hard delete)
- Check-in creates a visit and navigates to visit detail
- APPOINTMENT_CONFLICT error displays correctly via toast

### Dependencies
- Phase 3 (patient data, layout shell)

---

## Phase 5 — Visit / Clinical Documentation
**Status**: ✅ Complete  
**Spec**: `specs/005-clinical-visit/`  
**Goal**: Visit detail page with diagnosis notes, odontogram grid, and treatment plan.

### Scope
- Visits list: table of all visits (filtered by role), paginated
  → GET `/api/v1/visits`
- Visit detail ("Consultation & Examination"):
  - Patient sidebar: name, DOB, patient_number, last visit date, medical alerts
  - Diagnosis & Notes: chief complaint, clinical diagnosis, doctor notes (from `visit.notes`)
  - Odontogram: 32-tooth static grid (2 rows × 16), click to cycle condition (Healthy/Decay/Filling/Missing)
    → POST `/api/v1/visits/{id}/teeth`
  - Active Treatment Plan table: service name, tooth#, qty, price, discount, total
    → Add: POST `/api/v1/visits/{id}/services`
    → Remove: DELETE `/api/v1/visits/{id}/services/{id}`
  - Role gating: Doctor (own visits) and Super-Admin (override) have write access; Admin has read-only access (for administrative tracking)
- "View History" / "Documents" buttons navigate to patient profile

### Design Reference
- `lumina_dental_patient_visit/screen.png`

### Exit Criteria
- Visit detail loads all sections from real API data
- Odontogram state changes persist via API
- Adding/removing services updates the treatment plan in real time
- Admin user can view visit clinical data in read-only mode (write controls hidden/disabled)
- VISIT_NOT_EDITABLE error toasts correctly when visit is closed
- EN and AR pass layout check

### Dependencies
- Phase 4 (appointments → check-in → visit creation)

---

## Phase 6 — Billing / Financial Management
**Status**: ⬜ Not started  
**Spec**: `specs/006-billing/`  
**Goal**: Invoice list, invoice detail, record payment, create invoice from visit.

### Scope
- Financial Management page: tabs (Invoices | Payments | Revenue Reports — Reports tab is stub)
- KPI summary cards (Daily Revenue placeholder, Monthly Revenue placeholder,
  Outstanding Payments from API, Completed Treatments from API)
- Invoice list: paginated, filter by date range + status, search by invoice# or patient
  → GET `/api/v1/invoices`
- Invoice detail: full printable invoice layout, From/To, line items, totals, balance
  → GET `/api/v1/invoices/{id}`
- Action bar: Print (window.print()), PDF (browser print with CSS), Email (mailto fallback),
  Record Payment button
- Record Payment modal: amount, method (cash/card/insurance), notes
  → POST `/api/v1/invoices/{id}/payments`
- Create Invoice from Visit: button on visit detail → POST `/api/v1/visits/{id}/invoice`
- Role gating: Allowed for super-admin, admin, doctor, and accountant

### Design Reference
- `lumina_dental_invoices_list/screen.png`
- `lumina_dental_invoice_details/screen.png`
- `lumina_dental_record_payment_modal/screen.png`

### Exit Criteria
- Invoice list loads real data with pagination, filtering, and search
- Invoice detail renders correctly and is printable
- Recording a payment updates the balance displayed
- VISIT_ALREADY_INVOICED and PAYMENT_EXCEEDS_BALANCE errors toast correctly
- EN and AR layouts correct

### Dependencies
- Phase 5 (visit flow, treatment plan → invoiceable)

---

## Phase 7 — Inventory Management
**Status**: ⬜ Not started  
**Spec**: `specs/007-inventory/`  
**Goal**: Inventory items list, purchases list, receive purchase, service consumption templates.

### Scope
- Inventory Items list: paginated, name, category, current stock, unit, reorder level
  → GET `/api/v1/inventory/items`
- Item detail page
- Purchases list: paginated, status (pending/received/cancelled)
  → GET `/api/v1/purchases`
- Create Purchase modal: supplier, items + quantities
  → POST `/api/v1/purchases`
- Receive Purchase button: POST `/api/v1/purchases/{id}/receive`
- Service Consumption Templates: shown on service detail
  → GET/POST/DELETE `/api/v1/services/{id}/consumption`

### Exit Criteria
- Inventory list loads with real stock levels
- Purchase workflow (create → receive) works end-to-end
- inventory-manager role sees Inventory in sidebar; admin sees read-only view
- EN and AR layouts correct

### Dependencies
- Phase 2 (layout shell, sidebar)

---

## Phase 8 — Users & Permissions + Settings Stub
**Status**: ⬜ Not started  
**Spec**: `specs/008-users/`  
**Goal**: User management list + create user; permissions matrix display; settings stub page.

### Scope
- Users list: name, email, role, branch, status
- Create User form (admin/super-admin)
- Role Permissions matrix: visual-only read display (no write API in V1)
  → Reference: `lumina_dental_role_permissions/screen.png`
- User management: reference `lumina_dental_users_management/screen.png`
  and `lumina_dental_create_user_form/screen.png`
- Settings: placeholder page "System Settings — Coming Soon"
- Doctor Availability stub page: reference `lumina_dental_doctor_availability/screen.png` (read-only)
- System Settings stub: reference `lumina_dental_system_settings/screen.png`

### Exit Criteria
- Users list loads real users; create user form works via API
- Permissions matrix displays correctly (visual-only)
- super-admin only sees Users & Permissions in navigation
- EN and AR layouts correct

### Dependencies
- Phase 2 (layout shell), Phase 1 (auth — user context)

---

## Phase 9 — Polish, RTL Audit & Accessibility Pass
**Status**: ⬜ Not started  
**Spec**: `specs/009-polish/`  
**Goal**: Systematic cross-cutting quality pass — RTL correctness, loading states, empty states,
error boundaries, accessibility gate.

### Scope
- Run `i18n-rtl-audit` skill against all implemented pages (EN × {desktop, tablet} and AR × {desktop, tablet})
- Fix all RTL mirroring issues found: physical → logical CSS, icon flips, sidebar position
- Fill Arabic translations for all `ar.json` keys (or confirm fallback policy for V1)
- Loading skeleton components for all list views that lack them
- Empty-state components for all zero-result scenarios
- Error boundaries wrapping all route segments
- 404 page with locale-aware message
- Consistent toast notification system audit
- `console.error` and lint cleanup (`npm run lint`)
- Final build check (`npm run build`)

### Design Reference
- `lumina_dental_patients_list_arabic_rtl/screen.png`
- `lumina_dental_dashboard_arabic_rtl/screen.png`

### Exit Criteria
- `i18n-rtl-audit` reports zero RTL mirroring bugs across all pages
- `npm run build` exits 0 with no errors
- All WCAG 2.1 AA checklist items from the constitution (Article XI) pass
- No hardcoded English strings detected by static grep of component files

### Dependencies
- All previous phases complete

---

## Phase Status Summary

| Phase | Name | Status | Spec |
|---|---|---|---|
| 0 | Foundation & Constitution | ✅ COMPLETE | N/A |
| 1 | Authentication | ✅ COMPLETE | `specs/001-authentication/` |
| 2 | Dashboard | ⬜ Not started | `specs/002-dashboard/` |
| 3 | Patient Registry | ⬜ Not started | `specs/003-patient-registry/` |
| 4 | Appointments | ⬜ Not started | `specs/004-appointments/` |
| 5 | Visit / Clinical | ⬜ Not started | `specs/005-clinical-visit/` |
| 6 | Billing | ⬜ Not started | `specs/006-billing/` |
| 7 | Inventory | ⬜ Not started | `specs/007-inventory/` |
| 8 | Users & Permissions | ⬜ Not started | `specs/008-users/` |
| 9 | Polish & RTL Audit | ⬜ Not started | `specs/009-polish/` |

