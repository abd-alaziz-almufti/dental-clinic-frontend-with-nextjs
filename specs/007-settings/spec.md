# Feature Spec 007: Practice Settings & Preferences

**Feature Name**: Practice & System Settings Management  
**Phase**: Phase 8 / 007-settings  
**Target Roles**: `super-admin`, `admin`  

---

## 1. Overview & Business Value

The Settings module allows clinic administrators and super-administrators to manage core practice identity details (Clinic Name, Tax Registration Number, Contact Info, Address, Currency) and configure system-wide operational preferences (Default Language, Date Format, Default Tax Rate, Max Discount Cap).

In V1 scope, practice settings provide the authoritative clinic header info used on printed invoices, financial receipts, and system notifications.

---

## 2. Target Users & Access Boundaries

- **super-admin**: Full access to view and update practice settings across all branches.
- **admin**: Can view and update branch-level practice info and preferences for their assigned branch.
- **doctor**: Access denied (`403 FORBIDDEN` — hidden from sidebar navigation).

---

## 3. User Stories

1. **US-SET-01 (Practice Profile)**: As an Admin, I want to update our clinic name, address, tax number, and phone number so that all generated invoices display accurate practice information.
2. **US-SET-02 (System Preferences)**: As an Admin, I want to configure default language preferences (Arabic / English) and date formatting so that staff operate in their preferred locale.
3. **US-SET-03 (Financial Defaults)**: As an Admin, I want to specify default tax rates (%) and maximum allowed discount caps so that staff cannot apply unauthorized discounts.

---

## 4. Sub-Modules & Tab Architecture

The Settings workspace is organized into **2 core tabs**:

1. **General Practice Information (`general`)**:
   - Clinic / Practice Name (EN & AR)
   - Commercial Registration / Tax Identification Number (VAT/TRN)
   - Phone Number, Email, Official Website
   - Physical Address (City, District, Street, Postal Code)
   - Primary Currency (`SAR`, `USD`, `AED`)

2. **System Preferences & Financial Controls (`preferences`)**:
   - Default Interface Language (`ar` / `en`)
   - Preferred Date Display Format (`YYYY-MM-DD`, `DD/MM/YYYY`)
   - Default Tax Rate (`15%` VAT)
   - Maximum Discount Cap Percentage (`0%` - `50%`)
   - Automatic Invoice Generation on Visit Check-Out toggle

---

## 5. API Data Model & Endpoints Contract

### Endpoints (V1 Spec Target)

```
GET    /api/v1/settings             -> Fetch practice settings & preferences
PUT    /api/v1/settings             -> Update practice settings & preferences
```

### Request / Response Schema

```json
{
  "success": true,
  "message": "Settings retrieved successfully.",
  "data": {
    "clinic_name_en": "Lumina Dental Clinic",
    "clinic_name_ar": "عيادة لومينا لطب الأسنان",
    "tax_number": "310123456700003",
    "phone": "+966 11 123 4567",
    "email": "info@luminadental.sa",
    "address": "123 Medical District, Riyadh, Saudi Arabia",
    "currency": "SAR",
    "default_language": "ar",
    "date_format": "YYYY-MM-DD",
    "default_tax_rate": 15.00,
    "max_discount_percentage": 25.00,
    "auto_invoice_on_checkout": true
  }
}
```

---

## 6. UI/UX Design System Guidelines

- **Card Panels**: Clean, structured white cards with `border border-slate-200 shadow-xs`.
- **Form Controls**: Standardized inputs with clear labels, mandatory indicators (`*`), focus rings (`focus:ring-2 focus:ring-teal-500`).
- **RTL & LTR Support**: Fully responsive with directional utility classes (`ms-*`, `me-*`, `text-start`, `text-end`).
- **Save Actions**: Sticky bottom bar or top-right Save Button with pending/loading spinner state.

---

## 7. Out of Scope for V1

- `doctor_schedules` (availability calendars, vacations, shift roster) — Deferred to V2 per PRD line 395.
- Multi-branch settings overrides for doctors — Deferred to V2.
