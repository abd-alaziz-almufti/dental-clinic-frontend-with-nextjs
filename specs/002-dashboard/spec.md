# Feature Specification: Phase 2 — Dashboard & Layout Shell

**Feature ID**: `002-dashboard`  
**Status**: In Progress  
**PRD Reference**: Section 4 (Dashboard & Navigation), Section 11 (Permissions Matrix)  

## User Stories & Functional Requirements

### User Story 1: Role-Gated Application Shell
As an authenticated user (super-admin, admin, or doctor),  
I want a consistent application shell with a sidebar, header, and main content area,  
So that I can navigate between available features according to my assigned role.

#### Acceptance Criteria
1. The sidebar features a fixed width (264px desktop) with Lumina Dental logo, branding, and navigation items.
2. Navigation links are filtered based on the active user role:
   - `super-admin`: All links (Dashboard, Patients, Appointments, Visits, Doctors, Services, Billing, Reports, Inventory, Users & Permissions, Settings).
   - `admin`: All links except global user catalog if restricted to branch.
   - `doctor`: Dashboard, Patients (assigned), Appointments (my appointments), Visits (my visits), Profile.
3. Sticky top header displays global search placeholder, EN/AR language switcher, notification icon, and user profile summary with logout action.
4. Layout supports RTL direction when Arabic locale (`ar`) is selected.

---

### User Story 2: Admin Dashboard (KPI Overview & Analytics)
As an Admin or Super-Admin,  
I want to view practice KPI metrics and today's operational summary on my dashboard,  
So that I can quickly assess clinic performance and manage daily workflow.

#### Acceptance Criteria
1. Top KPI Cards:
   - Today's Appointments (fetched from `/api/v1/appointments?filter[date]=today` or total count).
   - Total Patients (fetched from `/api/v1/patients` total).
   - Today's Revenue (placeholder/calculated metric).
   - Pending Payments / Active Doctors.
2. Quick Actions Panel: Buttons for "Add Patient", "Create Appointment", "New Visit" (navigates to relevant routes).
3. Revenue Chart: Visual bar chart displaying weekly/monthly revenue performance.
4. Today's Appointments Table: Real-time list of appointments scheduled for the current day.

---

### User Story 3: Doctor Dashboard (Schedule Timeline)
As a Doctor,  
I want a focused view of my schedule and upcoming patient visits for today,  
So that I can prepare for consultations efficiently.

#### Acceptance Criteria
1. Personalized greeting header (`Good morning, Dr. {Name}`).
2. Timeline view of today's appointments assigned to the logged-in doctor.
3. Quick access to start a visit or view patient profile from the appointment item.
