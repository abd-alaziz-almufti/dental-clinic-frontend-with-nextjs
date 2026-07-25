# Architecture & Implementation Plan: Phase 2 — Dashboard

**Spec Reference**: [`spec.md`](./spec.md)  
**PRD Reference**: Sections 4, 9, 11  

## Architecture Overview

Phase 2 builds the core navigation shell and dashboards:

```
src/
├── app/
│   └── [locale]/
│       ├── dashboard/
│       │   └── page.jsx             # Role switcher (Admin vs Doctor dashboard)
│       ├── patients/page.jsx        # Stub page
│       ├── appointments/page.jsx    # Stub page
│       ├── visits/page.jsx          # Stub page
│       ├── doctors/page.jsx         # Stub page
│       ├── services/page.jsx        # Stub page
│       ├── billing/page.jsx         # Stub page
│       ├── inventory/page.jsx       # Stub page
│       ├── users/page.jsx           # Stub page
│       └── settings/page.jsx        # Stub page
├── components/
│   └── layout/
│       ├── Header.jsx               # Sticky top header + language switcher + logout
│       ├── Sidebar.jsx              # Role-gated fixed navigation
│       └── DashboardLayout.jsx      # Layout container wrapping authenticated pages
└── features/
    └── dashboard/
        ├── components/
        │   ├── KpiCard.jsx          # Metric cards
        │   ├── QuickActions.jsx     # Navigation shortcuts
        │   ├── RevenueChart.jsx     # Visual bar chart component
        │   ├── AdminDashboard.jsx   # Admin KPI & overview layout
        │   └── DoctorDashboard.jsx  # Doctor schedule & timeline layout
        └── services/
            └── dashboardService.js  # Service layer fetching appointment & patient counts
```

## Role Permissions for Navigation Links

| Path | Icon | Label Key | `super-admin` | `admin` | `doctor` |
|---|---|---|:---:|:---:|:---:|
| `/dashboard` | `dashboard` | `nav.dashboard` | ✅ | ✅ | ✅ |
| `/patients` | `person` | `nav.patients` | ✅ | ✅ | ✅ |
| `/appointments` | `event` | `nav.appointments` | ✅ | ✅ | ✅ |
| `/visits` | `medical_services` | `nav.visits` | ✅ | ✅ | ✅ |
| `/doctors` | `medical_information` | `nav.doctors` | ✅ | ✅ | ❌ |
| `/services` | `settings_suggest` | `nav.services` | ✅ | ✅ | ❌ |
| `/billing` | `payments` | `nav.billing` | ✅ | ✅ | ✅ |
| `/reports` | `assessment` | `nav.reports` | ✅ | ✅ | ❌ |
| `/inventory` | `inventory_2` | `nav.inventory` | ✅ | ✅ | ✅ |
| `/users` | `admin_panel_settings` | `nav.users` | ✅ | ✅ | ❌ |
| `/settings` | `settings` | `nav.settings` | ✅ | ✅ | ❌ |
