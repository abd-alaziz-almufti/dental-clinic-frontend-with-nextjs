<!--
Sync Impact Report
- Version: N/A → 1.0.0 (initial ratification)
- Rationale: MAJOR — first ratified version. Establishes all governing principles for the
  frontend project. These principles mirror and complement the backend constitution
  at D:\Projects\DentalClinicManagementSystem\.specify\memory\constitution.md
  (backend v1.0.0, ratified 2026-07-20).
- Principles established: I–XII (see below)
- Source: Derived from PRD_LuminaDental_Frontend.md, the backend API contract spec
  (specs/004-http-api-layer/spec.md), and the stitch_dentoflow_enterprise_dashboard
  UI reference designs.
- Templates requiring updates:
  ✅ spec-template.md — Constitution Check section should reference Articles I–XII
  ✅ plan-template.md — same
  ✅ tasks-template.md — Article II (vertical slices) and Article IX (i18n) as first-class task types
-->

# Lumina Dental Frontend Constitution

## Project Purpose

Build the production-grade Next.js 16 frontend for the Lumina Dental enterprise clinic
management system. The frontend consumes the Laravel 13 API exclusively over HTTP, matching
the "Lumina Dental" / "DentalPro Elite" design system from the reference screens, supporting
six staff roles with bilingual (English LTR + Arabic RTL) UI, and delivering each capability
as a complete vertical slice rather than layer-by-layer.

---

## Core Principles

### I. API Contract Is the Only Truth

The frontend MUST treat the backend's API contract (uniform envelope, error_code catalog,
pagination meta) as the sole source of truth for data structure. No frontend component
may assume a response shape not documented in the backend spec or inferred from a partial
response. All API interactions MUST route through the centralized Axios instance
(`src/config/axios.js`) — never via raw `fetch()` calls.

**Rationale**: A direct coupling between UI components and undocumented response assumptions
causes cascading breakage when the backend evolves. One centralized client is one place to
fix changes.

### II. Vertical Slices Only — No Horizontal Layers

Each implemented phase MUST deliver one complete, end-to-end demoable capability: routing +
UI + API wiring together. A phase MUST NOT deliver "all the components" without API wiring
or "all the API calls" without UI. The ROADMAP.md defines the phase order and each phase's
exit criteria — exit criteria MUST be met before a phase is marked done.

**Rationale**: Horizontal layers (UI layer done, then API layer done) create a long valley of
zero demonstrable value and make integration bugs late and expensive.

### III. Error Codes, Never Message Text

Frontend logic (redirects, conditional rendering, retry behavior) MUST branch on the
`error_code` field of the backend's error envelope, NEVER on the `message` string. The
`message` is localized and may change; `error_code` is a stable contract. Every `error_code`
in the backend catalog (Appendix B of the PRD) MUST have a corresponding translation key in
both `messages/en.json` and `messages/ar.json`.

**Rationale**: Branching on message strings breaks silently when the backend changes copy or
locale — a bug that is invisible in tests and only surfaces in production.

### IV. Role-Based UI Is a Convenience Layer, Not a Security Boundary

The frontend MUST conditionally render action buttons and navigation items based on the
authenticated user's `roles[]` from `/api/v1/me`. This is a UX improvement only. The backend
enforces authorization authoritatively — a 403 from the backend MUST always be handled
gracefully even if the frontend "should not" have allowed the action. Frontend role checks
MUST use a single shared `useAuth()` hook / `can(role, action)` utility — never inline
string comparisons duplicated across components.

**Rationale**: Security through UI is no security. Shared utility prevents drift between
what the UI hides and what it actually guards.

### V. Bilingual From Day One — No Locale Retrofitting

Every phase MUST be fully implemented in both `en` and `ar` locales before its exit criteria
are met. Arabic strings may begin as English fallbacks (empty `ar.json` key falls back to
`en.json`), but the component structure MUST use `useTranslations()` for every user-facing
string from the first commit — no hardcoded English strings in JSX.

**Rationale**: Retrofitting i18n onto a codebase built without it requires touching every
file. Building it in from day one costs almost nothing incrementally.

### VI. Logical CSS Properties Only — No Physical Margin/Padding for Layout

All layout-affecting spacing MUST use CSS logical properties: `margin-inline-start`
(`ms-*`), `margin-inline-end` (`me-*`), `padding-inline-start` (`ps-*`),
`padding-inline-end` (`pe-*`) via Tailwind v4 utilities. Physical properties (`ml-`, `mr-`,
`pl-`, `pr-`, `left:`, `right:`) are PROHIBITED for any spacing that needs to flip between
LTR and RTL. Exceptions (truly directional-invariant items like a logo mark) MUST be
documented in-component.

**Rationale**: Physical properties are invisible bugs in RTL — they look correct in English
and only fail in Arabic, where they're often not noticed until late in development.

### VII. Centralized Axios Configuration + Interceptors

The Axios instance at `src/config/axios.js` is the single HTTP client. It MUST carry:
1. `Authorization: Bearer <token>` interceptor (request)
2. 401 → clear token + redirect to login interceptor (response)
3. Accept-Language header set from the active locale

No component may create its own Axios instance or intercept at the component level. New
cross-cutting concerns (rate limit handling, retry logic) MUST be added to this single
instance, not scattered across feature services.

**Rationale**: Interceptors in multiple places leads to inconsistent auth handling, duplicate
logic, and race conditions on token invalidation.

### VIII. Feature-First Directory Structure

Code MUST be organized by feature (`src/features/auth/`, `src/features/patients/`, etc.),
not by technical layer (`src/components/`, `src/services/` across all features). Each
feature folder contains its own `api/`, `components/`, `hooks/`, and `types/` subdirectories.
Truly shared UI primitives (Button, Modal, Badge, Table) live in `src/components/ui/`.
Cross-feature shared hooks live in `src/hooks/`. No flat `src/pages/` equivalent — routing
uses Next.js App Router with feature-aligned route segments.

**Rationale**: Feature-first structure scales — adding a feature means adding one folder,
not scattering files across six flat directories.

### IX. No Unbounded Data Fetches

Every list endpoint call MUST include pagination parameters (`page`, `per_page`). `per_page`
defaults to 20 and MUST NOT exceed 100. No component may render an infinite or
unpaginated list. Loading states (skeleton UI) and empty states (empty-state component with
actionable message) MUST be implemented for every list view in the same phase that builds
that list.

**Rationale**: An unbounded fetch that works fine at 10 records causes a timeout at 10,000.
Loading and empty states are not polish — they are the correct behavior for the normal
operation of a paginated API.

### X. Design System Compliance — Lumina Dental Visual Language

All new UI surfaces MUST use the Lumina Dental design tokens defined in the PRD (§7 Visual
Identity): the teal-600 primary, Inter font, card/badge/spacing conventions, and status
badge color semantics. No component may introduce an ad-hoc color, a new font, or a
non-standard border-radius without a documented design decision. The reference `screen.png`
files in `stitch_dentoflow_enterprise_dashboard/` are the visual source of truth for each
page's layout.

**Rationale**: A consistent visual language is not decoration — it is the difference between
a product that feels built and one that feels assembled.

### XI. Accessibility as a Phase Completion Gate

WCAG 2.1 AA compliance is a completion criterion for every UI phase, not a retrospective
audit. Specifically: every modal MUST be focus-trapped; every icon-only button MUST have
`aria-label`; every form field MUST have an associated `<label>`; color alone MUST NOT
convey status (text accompanies all badges); and error messages MUST use `role="alert"` or
`aria-live="polite"`. An i18n-rtl-audit pass (skill available at
`D:\Projects\skills\i18n-rtl-audit\SKILL.md`) MUST be run after Phase 9 (polish) and
before that phase's exit criteria are considered met.

**Rationale**: Accessibility retrofitted at the end of a project is expensive and often
incomplete. Treating it as a phase gate means it's built in.

### XII. No Backend Logic in the Frontend

The frontend MUST NOT re-implement business rules that belong to the backend. Examples of
prohibited patterns: computing `remaining_balance` from invoice total minus payments client-
side; enforcing appointment conflict detection in a form validator; preventing a visit
service addition based on visit status checked locally. The frontend submits the request
and handles the structured error response from the backend. Frontend validation is limited
to UX-level form checks (required fields, format validation) — not business-rule enforcement.

**Rationale**: Duplicated business logic in the frontend diverges from the backend over time,
creating silent split-brain bugs where the UI allows something the API refuses.

---

## Technology Constraints

- **Framework**: Next.js 16 with App Router. Server Components for layout shells;
  Client Components only where interactivity is required.
- **Styling**: TailwindCSS 4 (already installed). CSS Modules are prohibited for new code.
  Tailwind v4 logical-property utilities (`ms-*`, `me-*`, `ps-*`, `pe-*`) required for
  all layout spacing.
- **HTTP**: Axios via the centralized `src/config/axios.js` instance only.
- **Forms**: React Hook Form + Zod for validation schemas.
- **i18n**: `next-intl` with `[locale]` App Router segment pattern.
- **Icons**: `lucide-react` only — no mixing of icon libraries.
- **Fonts**: `next/font/google` (Inter). No external font CDN links.
- **State**: React Context per feature + URL state. No global state library (Redux/Zustand)
  in V1.
- **Date formatting**: `date-fns` with locale support.

## Development Workflow

- Every feature MUST pass through the `speckit-*` workflow (specify → clarify → plan →
  tasks → implement) before implementation begins. Ad-hoc implementation without a spec
  is out of process.
- The `phased-delivery-workflow` skill (at
  `D:\Projects\skills\phased-delivery-workflow\SKILL.md`) governs the overall
  PRD → Roadmap → per-phase Spec Kit loop for this project.
- The `i18n-rtl-audit` skill (at `D:\Projects\skills\i18n-rtl-audit\SKILL.md`) MUST be
  run before Phase 9's exit criteria are declared met.
- The backend constitution (at
  `D:\Projects\DentalClinicManagementSystem\.specify\memory\constitution.md`) governs
  the backend. Frontend specs MUST be consistent with it — especially Articles I
  (no hard deletes), IX (localization), and X (API versioning + envelope).

## Governance

This constitution supersedes ad-hoc technical preference in any conflict.
Amendments require:

1. A documented rationale for the change.
2. A version bump per the policy below.
3. Propagation check against spec/plan/tasks templates for consistency.

### Versioning Policy (Semantic Versioning: MAJOR.MINOR.PATCH)

- **MAJOR**: Backward-incompatible principle changes.
- **MINOR**: A new principle or constraint added.
- **PATCH**: Wording clarifications with no change in obligation.

**Version**: 1.0.0 | **Ratified**: 2026-07-25 | **Last Amended**: 2026-07-25
