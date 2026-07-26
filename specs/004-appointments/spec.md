# Feature Specification: Phase 4 — Appointments & Scheduling

**Feature ID**: `004-appointments`  
**Status**: In Progress  
**PRD Reference**: Section 6 (Appointment Scheduling & Calendar)  

## Functional Requirements

### User Story 1: Appointment Calendar View & Filters
As an Admin or Doctor,  
I want to view scheduled clinic appointments on a calendar grid with Week and Day views,  
So that I can monitor daily consultation loads and time slot availability.

#### Acceptance Criteria
1. Displays appointments fetched from `GET /api/v1/appointments`.
2. Supports filtering by doctor (`filter[doctor_profile_id]`) and specific date (`filter[appointment_date]`).
3. Appointment items render with status color coding:
   - `scheduled` / `pending`: Blue / Amber
   - `confirmed`: Teal
   - `completed`: Green
   - `cancelled`: Red
4. Includes date navigation controls (Previous / Next week, Today shortcut).

---

### User Story 2: Book New Appointment
As an Admin, Receptionist, or Doctor,  
I want to book an appointment for a patient through a form modal,  
So that consultation time is reserved.

#### Acceptance Criteria
1. Modal opens via "+ Book Appointment" button.
2. Validates form fields:
   - Patient select (required)
   - Doctor select (required)
   - Appointment Date (required, today or future)
   - Start Time & End Time (required, valid time range)
   - Reason for visit (required string)
   - Notes (optional string)
3. Submits payload to `POST /api/v1/appointments`.
4. Refreshes calendar view on success.

---

### User Story 3: Cancel Appointment
As an Admin or Doctor,  
I want to cancel a scheduled appointment with confirmation,  
So that the time slot is freed.

#### Acceptance Criteria
1. User clicks "Cancel" on an appointment card.
2. Confirmation dialog prompts before executing `DELETE /api/v1/appointments/{id}`.
3. Updates appointment status to cancelled and updates UI.
