# Feature Specification: Practice Settings (Branch Profile)

**Feature Branch**: `007-settings`
**Created**: 2026-07-24
**Status**: Clarified — ready for `/speckit.plan`
**Depends on**: Foundation (`branches`)

## Context

Originally proposed as a broad "Practice Settings" module (tax engine,
multi-currency, discount caps, date formatting, auto-invoicing). Five
blocking Clarifications (C1–C5) were resolved on 2026-07-24, narrowing
this feature to a small, safe, additive scope: branch profile
editing, plus two new printable/cosmetic fields. Every larger concept
originally proposed is explicitly deferred (see Out of Scope) — this
spec covers only what was actually approved.

## Resolved Clarifications

- **C1**: No `organizations` table. "Practice Settings" = editing the
  existing `branches` row, plus two new columns: `tax_number` (nullable
  string) and `currency_code` (string, default `SAR`).
- **C2**: No tax calculation engine. `tax_number` is print-only —
  appears on invoice headers, never enters any total/balance calculation.
  Invoice math remains exactly `(unit_price × quantity) − discount_amount`,
  unchanged.
- **C3**: `currency_code` is a cosmetic display string only — no
  multi-currency conversion engine, no exchange rates, no per-transaction
  currency selection.
- **C4**: No system-wide discount cap. The only enforcement remains the
  existing per-line rule already in `RecordTreatmentService`
  (`discount_amount` cannot exceed `unit_price × quantity`) — unchanged,
  not extended.
- **C5**: Date formatting is entirely frontend-owned (`next-intl` /
  `Intl.DateTimeFormat`), confirmed out of backend scope. The API
  continues returning raw ISO 8601 dates everywhere, unchanged.

## User Scenarios & Testing

### Primary User Story

As an `admin`, I need to edit my branch's profile information (name,
contact details, address, tax number, currency display) so that
invoices and other printed documents reflect accurate, current
practice information — without needing `super-admin` access for routine
updates to my own branch.

### Acceptance Scenarios

1. **Given** an `admin`, **When** they view or update their own branch's
   profile, **Then** the request succeeds.
2. **Given** an `admin`, **When** they attempt to view or update a
   *different* branch's profile, **Then** the request is rejected
   (`FORBIDDEN`).
3. **Given** a `super-admin`, **When** they view or update any branch's
   profile, **Then** the request succeeds regardless of branch.
4. **Given** a `doctor`, **When** they attempt to access this module at
   all, **Then** the request is rejected — same boundary as
   `006-admin-management`'s Users module.
5. **Given** a valid update including a new `tax_number`, **When** an
   invoice is subsequently generated for that branch, **Then** the
   invoice's printable header reflects the updated `tax_number` — but
   the invoice's `total`/line calculations are completely unaffected by
   any settings field.

## Requirements

### Functional Requirements

- **FR-001**: System MUST allow viewing a single branch's profile
  (`name`, `phone`, `email`, `address`, `city`, `tax_number`,
  `currency_code`).
- **FR-002**: System MUST allow updating the same fields, restricted to
  `super-admin` (any branch) and `admin` (their own branch only).
- **FR-003**: System MUST reject `doctor` from this module entirely —
  no read, no write.
- **FR-004**: `tax_number` MUST be nullable free text — no format
  validation beyond a reasonable max length, no relationship to any
  financial calculation.
- **FR-005**: `currency_code` MUST be a plain string with a system
  default (`SAR`) — no validation against a real currency/exchange-rate
  system, since none exists.
- **FR-006**: System MUST also expose a list of branches (name + id at
  minimum) for use in other admin-only screens that need a branch
  selector (e.g., the Users creation form from `006-admin-management`),
  scoped the same way (`super-admin` sees all, `admin` sees only their
  own).

### Key Entities

- **Branch** (existing entity, additive change only): gains
  `tax_number` and `currency_code`. No new entity is introduced by this
  feature.

## Out of Scope (deferred, each requiring its own future spec if pursued)

- Tax calculation engine / `default_tax_rate` (C2) — would require
  amending `003-financial-module` directly (new `invoices` column,
  changed total calculation, likely a new ADR).
- Real multi-currency support (C3) — already excluded by
  `003-financial-module`.
- System-wide discount cap (C4) — the existing per-line
  `RecordTreatmentService` rule is unchanged and sufficient for V1.
- Date format preference (C5) — frontend-only, not a backend concept.
- `auto_invoice_on_checkout` — a genuinely new feature (automatic
  invoice generation tied to a "checkout" concept that doesn't exist in
  the current Visit status model) proposed mid-review without prior
  discussion; needs its own spec if pursued, not bundled here.
- `organizations` table / multi-branch-under-one-entity modeling (C1,
  Option B) — not needed for V1's actual approved scope.

## Review & Acceptance Checklist

- [x] No implementation details beyond the already-approved column names.
- [x] Every functional requirement is independently testable.
- [x] Scope is bounded — Out of Scope section is explicit and larger
      than the In Scope section, intentionally.
- [x] All five Clarifications resolved and reflected in Functional
      Requirements.