# Architecture & Implementation Plan: Phase 5 — Visit / Clinical Documentation

**Spec Reference**: [`spec.md`](./spec.md)  
**PRD Reference**: Section 7  

## Architecture Overview

Phase 5 builds the clinical examination module:

```
src/
├── app/
│   └── [locale]/
│       └── visits/
│           ├── page.jsx                    # Paginated visits list table
│           └── [id]/
│               └── page.jsx                # Clinical Examination workspace
└── features/
    └── visits/
        ├── components/
        │   ├── PatientSummarySidebar.jsx   # Sticky patient information sidebar
        │   ├── OdontogramGrid.jsx          # 32-tooth interactive dental chart
        │   └── TreatmentPlanTable.jsx      # Treatment services table & pricing
        └── services/
            └── visitService.js             # Axios API client calls
```

## API Endpoint Mapping

| Action | Endpoint | Params / Payload |
|---|---|---|
| List Visits | `GET /api/v1/visits` | `page`, `per_page`, `filter[status]`, `include=patient` |
| Get Visit Detail | `GET /api/v1/visits/{id}` | `include=patient,visitServices,visitTeeth,visitServices.service` |
| Add Tooth Condition | `POST /api/v1/visits/{id}/teeth` | `{ tooth_id, tooth_condition_id, entry_type }` |
| Remove Tooth Condition | `DELETE /api/v1/visits/{id}/teeth/{toothId}` | - |
| Add Service to Visit | `POST /api/v1/visits/{id}/services` | `{ service_id, tooth_number, quantity, price }` |
| Remove Service from Visit | `DELETE /api/v1/visits/{id}/services/{serviceId}` | - |
