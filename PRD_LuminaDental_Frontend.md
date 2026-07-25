# Product Requirements Document (PRD)
## Lumina Dental — Enterprise Dental Clinic Management Frontend

**Version:** 1.0  
**Created:** 2026-07-25  
**Status:** Ready for Spec Kit (phased-delivery-workflow)  
**Backend Ref:** `D:\Projects\DentalClinicManagementSystem` (Laravel 13 + Sanctum)  
**Design Ref:** `D:\Projects\stitch_dentoflow_enterprise_dashboard` (Lumina Dental / DentalPro Elite screens)  
**Frontend Stack:** Next.js 16 · React 19 · Axios · TailwindCSS 4

---

## 1. Overview

### 1.1 Problem Statement

The `DentalClinicManagementSystem` backend is a production-grade Laravel 13 API covering patient
records, scheduling, clinical documentation (dental chart), billing, and inventory. It has a
fully-built, tested HTTP layer (`/api/v1/...`) with Sanctum token auth, role-based authorization,
and a uniform JSON envelope. Currently it has no client — staff must interact with it only through
Tinker/Postman. This PRD scopes the React/Next.js frontend that makes the entire system
operational for real clinic staff.

### 1.2 Goals

1. **Connect** all existing backend capabilities over HTTP to a production-quality web UI.
2. **Match** the "Lumina Dental" design system defined in `stitch_dentoflow_enterprise_dashboard`
   — every screen already has a high-fidelity reference (`screen.png` + `code.html`).
3. **Respect** the backend's role model and authorization semantics on the frontend — the UI adapts
   to the authenticated user's role, showing only accessible actions.
4. **Bilingual from day one** — English (LTR) and Arabic (RTL), per Constitution Article IX. The
   backend returns raw ISO dates and numeric values; locale-specific formatting lives only in the
   frontend.
5. **Ship as vertical slices** — each phase delivers a complete, demoable capability (routing +
   UI + API wiring) rather than isolated layers.

### 1.3 Non-Goals (explicit MVP exclusions)

- **No file upload UI** — The backend `attachments` table/schema exists but the upload endpoint
  is deferred to Clinical V1.5; the frontend will display placeholder where X-ray thumbnails
  would appear, but no upload form ships in V1.
- **No SVG interactive dental chart** — Backend stores `visit_teeth` data; frontend renders a
  simple static odontogram (numbered grid, not SVG paths). Full SVG chart is V2.
- **No dashboard analytics / charting library** — Revenue charts on the dashboard are visual
  polish (static bars); no live chart library integration in V1 (recharts/chart.js are V2 scope).
- **No real-time / WebSocket updates** — Page-load-fresh is sufficient; no Pusher/Echo.
- **No patient self-service / booking portal** — Internal staff only.
- **No mobile-native app** — Responsive web down to tablet (768 px); phone-scale breakpoints are
  nice-to-have.
- **No E-Rx / lab integration** — "Quick Prescribe" widget visible in doctor dashboard design is
  decorative in V1.
- **No print/PDF generation client-side** — Invoice print uses browser `window.print()`; no
  headless PDF library.
- **No dark mode** — The reference designs are light-mode; dark-mode toggle is V2.
- **No expense management UI** — Backend `expenses` table is deferred; no frontend surface for it.

---

## 2. User Roles

User roles authenticated via Sanctum bearer token. The frontend derives the active role
from the `/api/v1/me` response (`roles[]` array). Each role sees a **different sidebar and
different action buttons** even on shared pages.

| Role | What they do in the UI | Scope / Authority |
|---|---|---|
| `super-admin` | Full system access across all branches | All branches (كل الفروع) |
| `admin` | Branch administrator; patient, appointment, financial & inventory management; medical data read-only | Own branch (فرعه فقط) |
| `doctor` | Clinical provider; manages own patients, appointments, visits, medical record writing, invoices, inventory | Own patients / visits (مرضاه / زياراته فقط) |
| `receptionist` | Patient registration, appointment booking, check-in | Branch receptionist |
| `accountant` | Financial management, invoice generation, recording payments | Branch accounting |
| `inventory-manager` | Inventory items, purchase orders | Branch inventory |

---

## 3. Functional Requirements by Role

### 3.1 Authentication (all roles)
- Login form → POST `/api/v1/login` → store bearer token in `localStorage`.
- Auto-redirect to role-appropriate default page after login.
- Logout button → POST `/api/v1/logout` → clear token, redirect to `/login`.
- Token expiry (8 h backend-enforced) → intercept 401 → redirect to login with
  "session expired" message.
- All API errors mapped via `error_code` (never message text), per API Contract Standard.

### 3.2 Dashboard (admin, super-admin, doctor, receptionist)
- **Admin/super-admin dashboard**: KPI cards (Today's Appointments, Total Patients,
  Today's Revenue, Pending Payments, Active Doctors), Quick Actions panel, Revenue bar
  chart (visual-only V1), Treatments donut (visual-only V1), Patient Growth line (visual-only V1).
- **Doctor dashboard**: Personalized greeting, Today's Patients / Completed Visits /
  Pending Treatments / Today's Revenue Est. KPIs, Today's Schedule timeline, Priority
  Follow-ups panel. Data from `/api/v1/appointments?filter[date]=today` scoped to
  the doctor automatically by the backend.

### 3.3 Patient Registry (receptionist, admin, super-admin, doctor)
- List view: paginated table, search (`?search=`), filter by doctor / status.
- Add/Edit Patient modal → POST `/api/v1/patients` (name, DOB, gender, phone, email, medical
  profile fields).
- Patient Profile page: header (name, DOB, ID, phone, email, assigned doctor), Medical
  Information card (allergies, conditions from medical profile), Treatment Timeline (visit
  history), Files & Imaging placeholder, Billing & Accounts summary (outstanding balance,
  invoice links).
- Scope: `super-admin` (all), `admin` (branch), `doctor` (own patients only).

### 3.4 Appointments (receptionist, doctor, admin, super-admin)
- Calendar view (week default, day/month toggle) — `/api/v1/appointments` paginated,
  filtered by date range.
- Create appointment modal → POST `/api/v1/appointments`.
- Delete (cancel) appointment → DELETE `/api/v1/appointments/{id}` (backend performs
  status transition, not hard delete per Constitution Article I).
- Status badges: `confirmed`, `pending`, `completed`, `cancelled`, `no_show`, `in-chair`.
- Check-in button → POST `/api/v1/appointments/{id}/check-in` → creates Visit, redirects
  to Visit detail page.
- Scope: `doctor` restricted to own appointments/visits.

### 3.5 Visits / Clinical Documentation (doctor, admin, super-admin)
- Visit detail page ("Consultation & Examination"): patient sidebar, Diagnosis & Notes
  fields (chief complaint, clinical diagnosis, doctor's notes — stored in visit's `notes`
  column), Odontogram (static 32-tooth grid, mark each tooth's condition), Active
  Treatment Plan (services added to visit).
- **Write Clinical Data (كتابة بيانات طبية)**: Doctor (own visits), Super-Admin (override). **Admin is READ-ONLY (❌ write)**.
- **Read Clinical Data (عرض بيانات طبية - قراءة فقط)**: Doctor (own visits), Admin (administrative tracking), Super-Admin (all).
- Add Treatment → POST `/api/v1/visits/{id}/services`.
- Remove Treatment → DELETE `/api/v1/visits/{id}/services/{serviceId}`.
- Add/Update tooth status → POST `/api/v1/visits/{id}/teeth`.
- Remove tooth record → DELETE `/api/v1/visits/{id}/teeth/{toothId}`.
- Visits list page: `/api/v1/visits` (all visits for this branch/doctor).

### 3.6 Financial Management — Billing (super-admin, admin, doctor, accountant)
- **Invoices list**: Financial Management page tabs (Invoices | Payments | Revenue Reports).
  KPI cards (Daily Revenue, Monthly Revenue, Outstanding Payments, Completed Treatments).
  Table: Invoice #, Patient, Doctor, Date, Total, Paid, Remaining, Status (Paid / Partial /
  Overdue). Filter by date range and status.
- **Invoice detail**: Full invoice view with From/To, line items, subtotal, discount, tax,
  total, amount paid, balance due. Action bar: Print, PDF (browser print), Email (mailto),
  Record Payment.
- **Record Payment modal**: amount, method (cash/card/insurance), notes →
  POST `/api/v1/invoices/{id}/payments`.
- **Create Invoice**: from visit → POST `/api/v1/visits/{visitId}/invoice`.
- Issue / Cancel Invoices & Record Payments: Allowed for `super-admin`, `admin`, `doctor`, `accountant`.

### 3.7 Inventory (super-admin, admin, doctor, inventory-manager)
- Inventory Items list: name, category, current stock, unit, reorder level, actions.
  GET `/api/v1/inventory/items`.
- Item detail page.
- Purchases list: GET `/api/v1/purchases`.
- Create Purchase → POST `/api/v1/purchases`.
- Receive Purchase → POST `/api/v1/purchases/{id}/receive`.
- Service Consumption Templates: GET/POST/DELETE `/api/v1/services/{id}/consumption`.
- Manage Inventory: Allowed for `super-admin`, `admin`, `doctor`, `inventory-manager`.

### 3.8 Users & Permissions (super-admin, admin)
- Users list: name, role, branch, status. Create User form.
- Role Permissions matrix: read-only display of which permissions map to which roles.
- Scope: `super-admin` (all branches), `admin` (own branch only). `doctor` (❌ disabled).

### 3.9 Settings (admin, super-admin)
- Placeholder page for future system settings. No writable settings API exists yet.

---

## 4. Surface Breakdown (pages/routes, by role)

| Route | Page | Roles |
|---|---|---|
| `/[locale]/login` | Login | public (unauthenticated only) |
| `/[locale]/dashboard` | Admin / Doctor Dashboard | all authenticated |
| `/[locale]/patients` | Patient Registry List | receptionist, admin, super-admin, doctor (own patients) |
| `/[locale]/patients/new` | Add Patient (modal on list) | receptionist, admin, super-admin, doctor |
| `/[locale]/patients/[id]` | Patient Profile | receptionist, admin, super-admin, doctor |
| `/[locale]/appointments` | Appointment Calendar | receptionist, admin, super-admin, doctor (own appointments) |
| `/[locale]/visits` | Visits List | receptionist, admin, super-admin, doctor (own visits) |
| `/[locale]/visits/[id]` | Visit Detail (Clinical) | doctor (write), admin (read-only), super-admin (override) |
| `/[locale]/billing` | Financial Management | super-admin, admin, doctor, accountant |
| `/[locale]/billing/invoices/[id]` | Invoice Detail | super-admin, admin, doctor, accountant |
| `/[locale]/inventory` | Inventory Items | super-admin, admin, doctor, inventory-manager |
| `/[locale]/inventory/purchases` | Purchases | super-admin, admin, doctor, inventory-manager |
| `/[locale]/users` | Users Management | super-admin (all branches), admin (own branch) |
| `/[locale]/settings` | Settings | admin, super-admin |
| `/[locale]/profile` | User Profile | all authenticated |

---

## 5. Data Model (frontend-side)

The frontend mirrors the backend's API Resource shapes. Key response shapes (from spec.md):

```json
// Success envelope
{ "success": true, "message": "string", "data": {} }

// Paginated success envelope
{ "success": true, "message": "string", "data": [], "meta": { "current_page": 1, "per_page": 20, "total": 143, "last_page": 8 } }

// Error envelope
{ "success": false, "message": "string", "error_code": "SCREAMING_SNAKE_CASE", "errors": {} }
```

Key entity shapes (from API Resources):
- **Patient**: `id`, `patient_number`, `first_name`, `last_name`, `date_of_birth`, `gender`,
  `phone`, `email`, `branch_id`, `medical_profile: { allergies, conditions }`.
- **Appointment**: `id`, `patient (name+id)`, `doctor (name+id)`, `starts_at`, `ends_at`,
  `status`, `branch_id`.
- **Visit**: `id`, `visit_number`, `patient`, `doctor`, `branch_id`, `status`, `notes`,
  `services[]`, `teeth[]`.
- **Invoice**: `id`, `invoice_number`, `visit_id`, `patient`, `total`, `status`, `issued_at`,
  `due_at`, `items[]`, `payments[]`.
- **Payment**: `id`, `invoice_id`, `amount`, `method`, `recorded_at`.
- **InventoryItem**: `id`, `name`, `current_stock`, `unit`, `reorder_level`.

---

## 6. Recommended Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | Next.js 16 (App Router) | Already installed; SSR optional, SPA-style client pages |
| Styling | TailwindCSS 4 | Already installed; matches the reference design's utility-first approach |
| HTTP | Axios (already installed) | Centralized instance in `src/config/axios.js` |
| Auth state | React Context + `localStorage` | Bearer token stored client-side |
| Forms | React Hook Form + Zod | Not yet installed — Phase 1 dependency |
| Routing guards | Next.js middleware (`middleware.js`) | Token presence check, role-based redirect |
| State management | React Context (per feature) + URL state | No Redux/Zustand needed for V1 scale |
| Date formatting | `date-fns` | Lightweight, tree-shakeable, supports AR locale |
| i18n | `next-intl` | RTL-aware, App Router native, matches Constitution Article IX |
| Icons | `lucide-react` | Matches the design system icon style |

---

## 7. Visual Identity

**Brand name**: Lumina Dental  
**Tagline**: Premium Care

**Color Palette** (derived from reference `screen.png` files):

| Token | Value | Usage |
|---|---|---|
| Primary | `#0D9488` (teal-600) | CTA buttons, active nav item, key accents |
| Primary Dark | `#0F766E` (teal-700) | Button hover state |
| Secondary | `#1D4ED8` (blue-700) | Links, secondary accents, invoice numbers |
| Success | `#16A34A` (green-600) | "Paid" badges, success toasts |
| Warning | `#D97706` (amber-600) | "Pending", "Partial" badges |
| Danger | `#DC2626` (red-600) | "Overdue", destructive actions, error toasts |
| Background | `#F8FAFC` (slate-50) | Page background |
| Card | `#FFFFFF` | Card / panel background |
| Sidebar BG | `#FFFFFF` | Sidebar background |
| Sidebar Active | `#F0FDF4` / `#CCFBF1` | Active nav item highlight (teal-50 / teal-100) |
| Border | `#E2E8F0` (slate-200) | Card borders, table dividers |
| Text Primary | `#0F172A` (slate-900) | Headings, primary text |
| Text Muted | `#64748B` (slate-500) | Labels, secondary text |

**Typography**:
- Font: Inter (Google Fonts via `next/font/google`)
- Heading lg: `text-2xl font-bold`
- Heading md: `text-xl font-semibold`
- Body: `text-sm` / `text-base`
- Labels / badges: `text-xs font-medium`

**Layout system**:
- Fixed left sidebar: 264 px wide (collapses to 64 px icon-only at `< lg`)
- Top header: 64 px tall, sticky
- Main content: `flex-1 overflow-auto p-6`
- Cards: `rounded-xl border border-slate-200 shadow-sm bg-white`
- Status badges: `rounded-full px-2.5 py-0.5 text-xs font-medium`

**RTL Layout**:
- Arabic layout mirrors the entire shell (sidebar slides to right, header elements reverse)
- All spacing uses Tailwind v4 logical-property utilities: `ms-*`, `me-*`, `ps-*`, `pe-*`
- Directional icons (arrows, chevrons, back buttons): `rtl:rotate-180` or RTL-specific variants

---

## 8. File & Data Handling

- **X-ray / imaging attachments**: Display-only placeholder cards in Patient Profile
  "Files & Imaging" section. No upload capability in V1.
- **Invoice printing**: `window.print()` with a `@media print` stylesheet that hides sidebar,
  header, and action buttons, and shows the invoice content full-width.
- **CSV exports**: Export button on invoice/patient lists is visible but shows "Coming Soon"
  toast in V1 (no API endpoint exists).
- **No file size limits** to enforce client-side in V1 (no uploads).

---

## 9. Internationalization

**Locales**: `en` (LTR, default) and `ar` (RTL).  
**Library**: `next-intl` with App Router `[locale]` segment pattern (`/en/...` and `/ar/...`).  
**Direction**: `<html dir="rtl" lang="ar">` or `<html dir="ltr" lang="en">` set by the active
locale segment via next-intl's `NextIntlClientProvider`.  
**CSS**: All layout uses CSS logical properties (`margin-inline-start`, `padding-inline-end`)
exposed via Tailwind v4 `ms-*`/`me-*`/`ps-*`/`pe-*` utilities. Physical properties
(`ml-`, `mr-`, `pl-`, `pr-`) are prohibited for layout spacing.  
**Dates**: `date-fns/locale/ar` for Arabic display formatting. API always returns ISO 8601;
the frontend formats for display only.  
**Numerals**: Arabic-Indic numerals (`ar` locale) vs. Western Arabic numerals (`en` locale)
handled via `Intl.NumberFormat`.  
**Translation files**:
- `messages/en.json` — English strings
- `messages/ar.json` — Arabic strings (stubbed initially, filled progressively)
- No hardcoded user-facing strings in component files — all via `useTranslations()` hook.

---

## 10. Non-Functional Requirements

### 10.1 Security
- **Token storage**: Bearer token stored in `localStorage`. Axios interceptor attaches
  `Authorization: Bearer <token>` on every request.
- **401 handling**: Axios response interceptor detects 401 → clears token → redirects to
  `/login` with locale-appropriate "session expired" query param.
- **CORS**: Backend already configured for `http://localhost:3000`.
- **Error display**: Raw `error_code` values MUST NOT be shown to end users — each code maps
  to a translation key (see Appendix B).
- **Route guard**: `middleware.js` checks token presence; unauthenticated users are redirected
  to `/[locale]/login`; authenticated users on `/login` are redirected to `/[locale]/dashboard`.
- **Sensitive data**: Password fields use `type="password"` with no `autocomplete="off"` (let
  password managers work).

### 10.2 Performance
- Client components used only where interactivity is required; layout shells as Server Components.
- All list pages paginate at `per_page=20` default; no unbounded API fetches.
- Images: Next.js `<Image>` for avatar/logo assets. Patient avatars use initials fallback.
- Fonts loaded via `next/font/google` (no external font requests at runtime).

### 10.3 Accessibility
- Target: WCAG 2.1 AA
- All interactive elements keyboard-navigable (Tab order, Enter/Space activation)
- Modals: focus-trapped, `aria-modal="true"`, `role="dialog"`, close on Escape
- Icon-only buttons: `aria-label` required
- Form fields: `<label>` associated via `htmlFor` or `aria-labelledby`
- Error toasts: `role="alert"` or `aria-live="polite"`
- Color alone is NEVER the sole indicator of status (badges also use text)

### 10.4 Browser / Device Support
- **Desktop**: Latest 2 versions of Chrome, Firefox, Edge, Safari
- **Tablet**: 768 px minimum width (sidebar collapses to icon-only at < 1024 px)
- **Phone**: Not a V1 requirement; layout should not break catastrophically

---

## 11. Permissions Matrix (جدول الصلاحيات المعتمد)

| Capability / Action (القدرة) | super-admin | admin | doctor |
|---|:---:|:---:|:---:|
| **إدارة الفروع/المستخدمين/الأدوار/كتالوج الخدمات**<br>*(Manage Branches/Users/Roles/Services Catalog)* | ✅ (كل الفروع) | ✅ (فرعه فقط) | ❌ |
| **تسجيل/عرض/تعديل بيانات مريض (اسم، هاتف...)**<br>*(Register/View/Edit Patient Data)* | ✅ (الكل) | ✅ (فرعه) | ✅ (مرضاه فقط) |
| **حجز/إدارة المواعيد**<br>*(Book/Manage Appointments)* | ✅ | ✅ | ✅ (مواعيده فقط) |
| **تسجيل حضور مريض / فتح زيارة**<br>*(Patient Check-in / Open Visit)* | ✅ | ✅ | ✅ (زياراته فقط) |
| **كتابة بيانات طبية (تشخيص، ملاحظات، مخطط سني، خدمات علاج)**<br>*(Write Clinical Data)* | ✅ (Override) | ❌ | ✅ (زياراته فقط) |
| **عرض بيانات طبية (قراءة فقط)**<br>*(View Clinical Data - Read Only)* | ✅ | ✅ (للمتابعة الإدارية) | ✅ (زياراته فقط) |
| **إصدار/إلغاء فواتير، تسجيل دفعات**<br>*(Issue/Cancel Invoices, Record Payments)* | ✅ | ✅ | ✅ |
| **إدارة المخزون**<br>*(Manage Inventory)* | ✅ | ✅ | ✅ |

> **Note**: Frontend renders action buttons conditionally based on the authenticated user's
> `roles[]` from `/api/v1/me`. The backend is the authoritative enforcement layer —
> the frontend is a UX convenience only (never a security boundary).

---

## 12. Notifications & Real-Time Behavior

- **No real-time push in V1**. Page-load data refresh is sufficient.
- The notification bell icon in the header is present in the design and is rendered, but
  shows an empty dropdown (or "No notifications" state) in V1.
- **Toast notifications**: Ephemeral feedback (3–5 s) for success/error actions.
  - Success: green, top-right, slides in/out
  - Error: red, top-right, slides in/out, stays until dismissed for critical errors
  - Implementation: lightweight custom hook (`useToast`) + portal, no heavy library.

---

## 13. Out of Scope (Explicit Exclusions)

The following are **not** part of V1 and are documented here so they are not accidentally
implemented or assumed:

| Exclusion | Future phase |
|---|---|
| File upload UI (X-rays, documents) | V1.5 |
| Interactive SVG Odontogram | V2 |
| Live chart library (Recharts, Chart.js) | V2 |
| WebSocket / real-time | V2 |
| Patient self-service portal | Out of scope indefinitely |
| Mobile-native / PWA | V2 |
| E-Rx, lab integration | V3+ |
| Client-side PDF generation | V1.5 |
| Dark mode | V2 |
| Expense management UI | When backend ships `expenses` endpoint |
| Revenue Reports tab content (billing page) | When reporting API is built |
| Permission editing via UI (write) | When backend adds permission management endpoint |
| Settings page real content | When backend settings API is designed |
| CSV/Excel export | When backend export endpoint is built |
| `doctor_schedules` (availability management) | V2 |
| Guardian fields for minor patients | V2 |
| Multi-branch switching for non-super-admin | V2 |

---

## 14. Risks & Open Items

| # | Risk / Open Item | Severity | Mitigation |
|---|---|---|---|
| R-01 | Backend HTTP layer tasks.md still in progress — some endpoints may not yet be available | **High** | Build each phase against MSW (Mock Service Worker) mocks; switch to real API endpoint-by-endpoint as backend deploys. |
| R-02 | `next-intl` App Router requires `[locale]` segment — changes URL structure from day one | **High** | Initialize locale routing in Phase 0 to avoid later restructuring. |
| R-03 | Token stored in `localStorage` is vulnerable to XSS | Medium | Ship with strict CSP headers; `httpOnly` cookie via Next.js proxy is V1.5 hardening path. |
| R-04 | Tailwind v4 (installed) has breaking changes vs v3 — logical properties syntax differs | Medium | Verify utility class names in Tailwind v4 docs before building; use `ms-*`/`me-*` consistently. |
| R-05 | Arabic translation content requires a translator / copywriter | Medium | Ship with `ar.json` falling back to English strings initially; translations filled progressively per phase. |
| R-06 | The `GET /api/v1/me` endpoint is not yet listed in `routes/api/v1.php` | Medium | Confirm endpoint exists; if not, add to backend before Phase 1 starts. |
| R-07 | Dashboard KPI data (Today's Revenue, Active Doctors, Pending Payments) has no dedicated aggregation endpoint — these require frontend-computed or new backend endpoints | Medium | Phase 1 uses placeholder/static data for dashboard KPIs; a dedicated `/api/v1/dashboard/summary` endpoint is a backend follow-up. |
| O-01 | Should the frontend have a Next.js API route proxy for the backend (to enable httpOnly cookies)? | Open | Decision deferred to Phase 1 start; default is direct Axios calls to backend. |
| O-02 | Invoice "Email" action — does the backend have an email-invoice endpoint? | Open | Not listed in current routes; will use `mailto:` fallback in V1. |

---

## 15. Glossary

| Term | Definition |
|---|---|
| **Sanctum** | Laravel's token-based authentication package used by the backend |
| **Envelope** | The uniform JSON wrapper `{ success, message, data }` returned by every backend endpoint |
| **error_code** | Language-invariant `SCREAMING_SNAKE_CASE` string in error envelopes that frontend logic branches on (never the `message` text) |
| **Odontogram** | The dental chart showing all 32 teeth and their clinical conditions |
| **Visit** | A clinical encounter, created via check-in from an appointment |
| **Snapshot** | Denormalized copy of a value (e.g., price) captured at the moment of the event |
| **Branch** | A physical clinic location; every record is branch-scoped |
| **Spec Kit** | The `speckit-*` workflow toolchain (`speckit-specify`, `plan`, `tasks`, `implement`) used to deliver each phase |
| **LTR / RTL** | Left-to-right (English) / Right-to-left (Arabic) text direction |
| **Phased delivery** | Each implementation phase ships a complete vertical slice (UI + API wiring), not a layer in isolation |
| **MSW** | Mock Service Worker — used to intercept API requests in the browser for development against not-yet-deployed endpoints |

---

## Appendix A — API Base URL & Environment

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api
# All requests go to: {NEXT_PUBLIC_API_URL}/v1/{endpoint}
```

- Backend dev server: `http://localhost:8000` (Laravel `php artisan serve`)
- Frontend dev server: `http://localhost:3000` (Next.js `npm run dev`)

## Appendix B — Backend Error Code → Frontend Toast/Message Mapping

| `error_code` | User-facing message (en) | i18n key |
|---|---|---|
| `UNAUTHENTICATED` | "Your session has expired. Please log in again." | `errors.unauthenticated` |
| `FORBIDDEN` | "You don't have permission to perform this action." | `errors.forbidden` |
| `NOT_FOUND` | "The requested record was not found." | `errors.not_found` |
| `VALIDATION_ERROR` | Field-level messages from `errors` object (shown inline) | `errors.validation` |
| `APPOINTMENT_CONFLICT` | "This time slot is already booked for that doctor." | `errors.appointment_conflict` |
| `INVALID_APPOINTMENT_STATUS` | "This appointment cannot be modified in its current status." | `errors.invalid_appointment_status` |
| `VISIT_NOT_EDITABLE` | "This visit can no longer be modified." | `errors.visit_not_editable` |
| `VISIT_ALREADY_INVOICED` | "An invoice already exists for this visit." | `errors.visit_already_invoiced` |
| `INVALID_INVOICE_STATUS` | "This invoice cannot be modified in its current status." | `errors.invalid_invoice_status` |
| `PAYMENT_EXCEEDS_BALANCE` | "The payment amount exceeds the remaining balance." | `errors.payment_exceeds_balance` |
| `TOO_MANY_REQUESTS` | "Too many attempts. Please wait before trying again." | `errors.too_many_requests` |
| `SERVER_ERROR` | "An unexpected error occurred. Please try again." | `errors.server_error` |

## Appendix C — Phased Delivery Roadmap (preview)

The following phases will be specified via the `phased-delivery-workflow` skill. Each phase maps
to exactly one Spec Kit feature (`specs/NNN-feature-name/`).

| Phase | Capability | Exit Criteria |
|---|---|---|
| **Phase 0** | Foundation: Spec Kit init, constitution, project structure, i18n/locale routing, Axios config, auth skeleton | `/login` works, token stored, `/me` call succeeds, locale switch works |
| **Phase 1** | Authentication full: login page, token storage, Axios interceptors, route guards, `useAuth` hook | Login/logout works end-to-end with real backend |
| **Phase 2** | Dashboard: Admin KPI cards, Quick Actions, Doctor dashboard view | Dashboard renders real data per role |
| **Phase 3** | Patient Registry: list, search, filters, Add Patient modal, Patient Profile | CRUD patient flow works |
| **Phase 4** | Appointments: calendar view (week), create modal, cancel, check-in → visit | Full appointment lifecycle works |
| **Phase 5** | Visit / Clinical: visit detail, diagnosis notes, odontogram grid, add/remove services | Treatment recording works |
| **Phase 6** | Billing: invoice list, invoice detail, record payment, create invoice from visit | Financial flow works |
| **Phase 7** | Inventory: items list, purchases list, receive purchase | Inventory management works |
| **Phase 8** | Users & Permissions, Settings stubs | Admin user management works |
| **Phase 9** | Polish: RTL audit, loading skeletons, empty states, error boundaries, accessibility pass | i18n-rtl-audit passes clean |
