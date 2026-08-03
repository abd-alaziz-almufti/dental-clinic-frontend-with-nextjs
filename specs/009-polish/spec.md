# Feature Specification: Phase 9 — Polish, RTL Audit & Accessibility Pass

**Feature Branch**: `009-polish`  
**Created**: 2026-08-03  
**Status**: Approved  
**Depends on**: Phase 0 to Phase 8  

## Context

Phase 9 is the final quality and refinement phase for the Lumina Dental Management System frontend.
The goal is to ensure the entire application operates seamlessly across languages (English LTR and Arabic RTL), satisfies accessibility guidelines (WCAG 2.1 AA), provides skeleton loading and empty state UX for all list views, includes error boundaries and 404 handling, and builds without warnings or errors.

## Acceptance Criteria

1. **RTL & Logical CSS Compliance**:
   - All spatial layout utilities must use logical directional properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`).
   - Text alignment must use `text-start` and `text-end`.
   - Modals, drawers, and popovers flip layout dynamically based on active locale direction (`dir="rtl"` vs `dir="ltr"`).

2. **Loading & Empty State UX**:
   - All list screens (Patients, Appointments, Visits, Billing, Inventory, Users) feature skeleton loaders while data is fetching.
   - All empty list queries present custom empty-state card components with localized guidance text.

3. **Error Boundaries & 404 Handling**:
   - Root error boundary (`error.jsx`) handles runtime exceptions gracefully.
   - Localized 404 page (`not-found.jsx`) handles invalid routes cleanly.

4. **Accessibility (WCAG 2.1 AA)**:
   - Form inputs have associated `<label>` elements or `aria-label`.
   - Interactive elements have explicit `focus:ring-2` styling.
   - Interactive icons include descriptive screen-reader labels.

5. **Build & Quality Gate**:
   - `npm run lint` completes cleanly with 0 errors.
   - `npm run build` succeeds without bundle/compilation issues.
