# Feature Specification: Phase 5 — Visit / Clinical Documentation

**Feature ID**: `005-clinical-visit`  
**Status**: In Progress  
**PRD Reference**: Section 7 (Clinical Visit & Examination)  

## Functional Requirements

### User Story 1: Visits Listing
As an Admin or Doctor,  
I want to view a paginated list of clinical visits,  
So that I can monitor in-progress examinations and completed visits.

#### Acceptance Criteria
1. Displays a table of visits fetched from `GET /api/v1/visits`.
2. Shows Visit Date, Patient Name, Doctor Name, Status (In Progress, Completed, Closed), and Action button ("Open Examination").
3. Doctor role sees only their visits (backend-enforced).

---

### User Story 2: Clinical Examination & Diagnosis Workspace
As a Doctor or Super-Admin,  
I want a dedicated examination workspace for a visit,  
So that I can record diagnosis notes, inspect patient medical alerts, and build the treatment plan.

#### Acceptance Criteria
1. Accessible at `/visits/{id}` route.
2. Patient Summary Sidebar displays patient avatar, name, DOB, medical alerts, allergies, and blood group.
3. Chief Complaint & Clinical Diagnosis text areas save doctor notes.
4. Active Treatment Plan Table lists treatment services added to the visit with real-time totals calculation.

---

### User Story 3: Interactive 32-Tooth Odontogram Grid
As a Doctor,  
I want an interactive 32-tooth odontogram grid,  
So that I can visually chart and record tooth conditions.

#### Acceptance Criteria
1. Displays 32 teeth divided into Upper Jaw (Teeth 1-16) and Lower Jaw (Teeth 17-32).
2. Supports tooth status conditions: Healthy (default), Decay (red badge), Filled (blue badge), Missing (gray/muted), Crown (purple badge).
3. Clicking a tooth opens condition picker and saves tooth entry via `POST /api/v1/visits/{id}/teeth`.

---

### User Story 4: Role-Based Access Control
As an Admin user,  
I want to view clinical visit data in read-only mode,  
So that administrative oversight is maintained without altering medical records.

#### Acceptance Criteria
1. Doctors and Super-Admins have full read/write access.
2. Admin role sees disabled/hidden write controls on Odontogram and Treatment Plan.
