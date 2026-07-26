# Architecture & Implementation Plan: Phase 4 — Appointments

**Spec Reference**: [`spec.md`](./spec.md)  
**PRD Reference**: Section 6  

## Architecture Overview

Phase 4 builds the appointment calendar module:

```
src/
├── app/
│   └── [locale]/
│       └── appointments/
│           └── page.jsx                  # Main calendar & schedule page
└── features/
    └── appointments/
        ├── components/
        │   ├── AppointmentCalendar.jsx   # Week/Day grid component
        │   ├── CreateAppointmentModal.jsx# Booking modal
        │   └── CancelAppointmentModal.jsx# Cancellation confirmation dialog
        ├── schemas/
        │   └── appointmentSchema.js      # Zod validation schema
        └── services/
            └── appointmentService.js     # API integration client
```

## API Endpoint Mapping

| Action | Endpoint | Params / Payload |
|---|---|---|
| List Appointments | `GET /api/v1/appointments` | `filter[appointment_date]`, `filter[doctor_profile_id]`, `filter[status]`, `include=patient,doctorProfile` |
| Book Appointment | `POST /api/v1/appointments` | `{ patient_id, doctor_profile_id, appointment_date, start_time, end_time, reason, notes, branch_id }` |
| Cancel Appointment | `DELETE /api/v1/appointments/{id}` | - |
