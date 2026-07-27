# Feature Specification: Phase 6 — Billing & Financial Management

**Feature ID**: `006-billing`  
**Status**: In Progress  
**PRD Reference**: Section 8 (Billing & Invoicing)  

## Functional Requirements

### User Story 1: Invoice List & Financial Overview
As an Admin, Super-Admin, Doctor, or Accountant,  
I want to view a paginated list of clinic invoices with status filters,  
So that I can monitor revenue, pending balances, and invoice statuses.

#### Acceptance Criteria
1. Displays paginated invoices fetched from `GET /api/v1/invoices`.
2. Shows Invoice Number, Patient Name, Issue Date, Total Amount, Paid Amount, Remaining Balance, and Status Badge.
3. Supports filtering by invoice status (`paid`, `partial`, `unpaid`, `overdue`, `cancelled`).

---

### User Story 2: Printable Invoice Detail
As an Admin, Doctor, or Patient,  
I want a printable detailed view of a selected invoice,  
So that itemized receipts can be printed or exported.

#### Acceptance Criteria
1. Accessible at `/billing/invoices/{id}` route.
2. Displays Clinic Header, Bill To Patient details, Issue Date, Due Date, and Status Badge.
3. Itemized Services Table: Service Name, Tooth #, Quantity, Unit Price, Discount, and Line Total.
4. Financial Summary: Subtotal, Total Discount, Net Total, Paid Amount, Remaining Balance.
5. Recorded Payments History Table.
6. Print action triggers browser `window.print()` with print-optimized CSS.

---

### User Story 3: Record Payment
As an Admin or Accountant,  
I want to record a payment against an invoice through a form modal,  
So that the invoice balance is updated accurately.

#### Acceptance Criteria
1. Triggered via "Record Payment" button on invoice list or detail view.
2. Validates Payment Amount (cannot exceed remaining balance), Payment Method (`cash`, `card`, `bank_transfer`, `insurance`, `other`), Payment Date, and optional Notes.
3. Submits payload to `POST /api/v1/invoices/{id}/payments`.
4. Displays `PAYMENT_EXCEEDS_BALANCE` error if amount is higher than remaining balance.
5. Updates invoice status to `paid` or `partial` on success.

---

### User Story 4: Generate Invoice from Visit
As a Doctor or Admin,  
I want to generate an invoice directly from a completed clinical visit,  
So that treatment plan services are billed automatically.

#### Acceptance Criteria
1. Button on Visit Detail view triggers `POST /api/v1/visits/{id}/invoice`.
2. Redirects or navigates to the generated Invoice Detail page.
3. Displays `VISIT_ALREADY_INVOICED` error if an invoice exists for that visit.
