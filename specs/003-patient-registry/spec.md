# Feature Specification: Phase 3 — Patient Registry

**Feature ID**: `003-patient-registry`  
**Status**: In Progress  
**PRD Reference**: Section 5 (Patient Registry & Medical Record)  

## Functional Requirements

### User Story 1: Patient List & Search
As an authorized user (Super-Admin, Branch Admin, or Doctor),  
I want to view and search a paginated list of clinic patients,  
So that I can quickly access patient records.

#### Acceptance Criteria
1. Displays a paginated table of patients fetched from `GET /api/v1/patients`.
2. Includes live search by patient name, phone number, or national ID.
3. Shows key patient columns: Patient Name & Initials Avatar, National ID, Phone, Gender, Registered Branch, Last Visit, and Financial Status Badge.
4. Doctor role sees only patients assigned to their consultations or visits (backend-enforced).

---

### User Story 2: Register New Patient
As an Admin or Receptionist,  
I want to register a new patient through a form modal,  
So that new patients are recorded in the clinic database.

#### Acceptance Criteria
1. Triggered via "+ Add Patient" button on the Patient Registry page or Quick Actions.
2. Modal form validates required fields:
   - First Name, Last Name (required strings)
   - Gender (`male`, `female`, `other`)
   - Birth Date (required date before today)
   - National ID (required unique string)
   - Phone (required string)
   - Email, Address (optional)
3. Submits payload to `POST /api/v1/patients`.
4. Displays field-level validation errors and toasts on success or API error.

---

### User Story 3: Patient Profile Detail View
As a Doctor or Admin,  
I want a comprehensive profile page for a selected patient,  
So that I can review medical history, visit timeline, and account balance.

#### Acceptance Criteria
1. Accessible via `/patients/{id}` route.
2. Patient Header: Avatar, Name, Age, DOB, Phone, Email, National ID, Financial Badge.
3. Medical Information Card: Medical alerts, allergies, chronic conditions, blood group.
4. Treatment & Visit History: Timeline of past visits and consultation notes.
5. Billing Summary: Overview of total billed, total paid, and pending balance.
