# Architecture & Implementation Plan: Phase 3 — Patient Registry

**Spec Reference**: [`spec.md`](./spec.md)  
**PRD Reference**: Section 5  

## Architecture Overview

Phase 3 builds the patient registry module:

```
src/
├── app/
│   └── [locale]/
│       └── patients/
│           ├── page.jsx                # Patient registry table & list view
│           └── [id]/
│               └── page.jsx            # Detailed Patient Profile page
└── features/
    └── patients/
        ├── components/
        │   ├── AddPatientModal.jsx     # Registration modal form
        │   ├── PatientAvatar.jsx       # Initials avatar fallback
        │   └── PatientStatusBadge.jsx  # Status badge component
        ├── schemas/
        │   └── patientSchema.js        # Zod validation schema
        └── services/
            └── patientService.js       # Axios API client calls
```

## API Endpoint Mapping

| Action | Endpoint | Params / Payload |
|---|---|---|
| List Patients | `GET /api/v1/patients` | `page`, `per_page`, `filter[phone]`, `filter[national_id]` |
| Get Patient Detail | `GET /api/v1/patients/{id}` | `include=medicalProfile` |
| Create Patient | `POST /api/v1/patients` | `{ first_name, last_name, gender, birth_date, national_id, phone, email, address, registered_branch_id }` |
