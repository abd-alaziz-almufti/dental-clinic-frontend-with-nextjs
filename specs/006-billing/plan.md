# Architecture & Implementation Plan: Phase 6 — Billing

**Spec Reference**: [`spec.md`](./spec.md)  
**PRD Reference**: Section 8  

## Architecture Overview

Phase 6 builds the billing and financial management module:

```
src/
├── app/
│   └── [locale]/
│       └── billing/
│           ├── page.jsx                      # Invoices list & financial overview
│           └── invoices/
│               └── [id]/
│                   └── page.jsx              # Printable Invoice Detail page
└── features/
    └── billing/
        ├── components/
        │   ├── InvoiceStatusBadge.jsx        # Status badge component
        │   └── RecordPaymentModal.jsx        # Payment recording modal dialog
        ├── schemas/
        │   └── paymentSchema.js              # Zod validation schema
        └── services/
            └── billingService.js             # API integration client
```

## API Endpoint Mapping

| Action | Endpoint | Params / Payload |
|---|---|---|
| List Invoices | `GET /api/v1/invoices` | `page`, `per_page`, `filter[status]`, `include=items,payments,patient` |
| Get Invoice Detail | `GET /api/v1/invoices/{id}` | `include=items,payments,patient` |
| Generate Invoice | `POST /api/v1/visits/{visitId}/invoice` | - |
| Record Payment | `POST /api/v1/invoices/{id}/payments` | `{ amount, payment_method, payment_date, notes }` |
| Cancel Invoice | `DELETE /api/v1/invoices/{id}` | `{ cancellation_reason }` |
