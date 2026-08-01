# Backend Update Note — for Frontend Agent

Quick summary of backend decisions/fixes made since `005-nextjs-frontend-foundation/spec.md` was written. Nothing here changes the API Contract Standard (envelope, error codes, pagination) — just role logic and a couple of infra fixes.

## 1. Final role model: 3 roles only

```
super-admin, admin, doctor
```

No `receptionist`, `accountant`, `inventory-manager`, or `operations-manager` — these were considered and dropped. If any earlier doc/screen references them, ignore it; treat this as the current source of truth.

## 2. Permission matrix (drives what UI to show/hide per role)

| Action | super-admin | admin | doctor |
|---|---|---|---|
| Patients, Appointments, Visits (check-in), Invoices, Payments, Inventory — create/read/write | ✅ all branches | ✅ own branch | ✅ own branch, scoped to their own patients/appointments/visits |
| **Writing clinical data** (diagnosis, doctor's notes, treatment plan, visit services, dental chart entries) | ✅ | ❌ read-only | ✅ own visits only |

**One rule to remember:** `admin` and `doctor` are equal everywhere EXCEPT clinical/medical writes, which are doctor-only. If `admin` tries to submit a diagnosis/treatment/dental-chart form, expect `403 FORBIDDEN` — build the UI to not even show those write controls to `admin`, not just to handle the error.

## 3. `doctor` visibility scope

A `doctor` only sees patients/appointments/visits they're actually connected to (via an existing appointment or visit) — not the full clinic list. Only `admin`/`super-admin` see the full branch/clinic-wide list. Relevant for how you build list screens per role.

## 4. CORS

Backend now enforces `CORS_ALLOWED_ORIGINS` explicitly (was previously wide open — fixed). Make sure whatever origin your dev server runs on is registered backend-side (default expected: `http://localhost:3000`). If you use a different port, tell us so we can add it.

## 5. Error handling reminder

Always branch frontend logic on `error_code` (fixed, English, e.g. `FORBIDDEN`, `VALIDATION_ERROR`, `APPOINTMENT_CONFLICT`), never on `message` (localized, changes with `Accept-Language`).

## 6. Localization now more complete

Arabic validation messages (`422` responses) are now fully localized too, not just custom domain exceptions — so field-level `errors` in Arabic should render correctly now if you're testing with `Accept-Language: ar`.