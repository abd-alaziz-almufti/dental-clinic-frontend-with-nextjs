# Specification: Phase 1 — Authentication & Authorization

**Feature Branch / Path**: `specs/001-authentication/`  
**PRD Ref**: [`PRD_LuminaDental_Frontend.md`](../../PRD_LuminaDental_Frontend.md) (§3.1, §6, §10.1, §11)  
**Constitution Ref**: [`.specify/memory/constitution.md`](../../.specify/memory/constitution.md) (Articles I, III, IV, V, VII)  
**Status**: DRAFT  

---

## 1. User Stories & Value Proposition

### 1.1 As a Clinic Staff Member (any role)
- **I want to** log in with my email and password on a clean, Lumina Dental branded login page.
- **So that** I can access the clinic management system with the permissions authorized for my role.

### 1.2 As an Authenticated Staff Member
- **I want to** remain securely logged in across page refreshes and be able to log out explicitly when my shift ends.
- **So that** unauthorized persons cannot use my active session.

### 1.3 As a System Administrator
- **I want** the frontend to adapt its navigation and UI controls to my exact role (`super-admin`, `admin`, `doctor`, etc.).
- **So that** staff only see features relevant to their role and authority.

---

## 2. Requirements & User Experience

### 2.1 Login Surface (`/[locale]/login`)
- Clean, centered card layout matching Lumina Dental visual identity (teal accent `#0D9488`, Inter font).
- Form fields: Email Address (type="email"), Password (type="password"), Remember me checkbox.
- Language switcher (English / العربية) in header or footer of login card.
- Client-side validation via React Hook Form + Zod (valid email format, non-empty password).
- Submit action triggers `POST /api/v1/login`.
- Loading state: Button text changes to "Signing in..." with spinner icon.
- Error handling: Maps API `error_code` (e.g. `UNAUTHENTICATED`, `VALIDATION_ERROR`) to localized error message toast/banner (never displays raw error code).

### 2.2 Auth State Management (`useAuth` & `AuthProvider`)
- `AuthProvider` wraps app in `[locale]/layout.jsx`.
- Stores `token` in `localStorage` and `user` object in React state.
- Exposes:
  - `user`: `{ id, name, email, roles: [], branch_id }`
  - `isAuthenticated`: boolean
  - `isLoading`: boolean
  - `login(email, password)`: async function
  - `logout()`: async function
  - `can(role | permission)`: helper function checking active user roles against required authority.

### 2.3 Route Guard & Redirects
- Unauthenticated user attempting to access protected route (e.g., `/[locale]/dashboard`) → redirected to `/[locale]/login`.
- Authenticated user visiting `/[locale]/login` → redirected to `/[locale]/dashboard`.
- Token expiration (401 from API) → token cleared, user redirected to `/[locale]/login?reason=expired` with localized toast message.

### 2.4 Bilingual Support (EN / AR)
- All copy in login form, error messages, and buttons resolves via `useTranslations("auth")` and `useTranslations("errors")`.
- RTL layout direction (`dir="rtl"`) respected in Arabic.

---

## 3. Technical Dependencies & API Contracts

### 3.1 API Endpoints
- **POST `/api/v1/login`**
  - Request: `{ "email": "admin@clinic.com", "password": "password" }`
  - Response (Success 200): `{ "success": true, "message": "...", "data": { "token": "...", "user": { "id": 1, "name": "...", "email": "...", "roles": ["super-admin"], "branch_id": 1 } } }`
  - Response (Error 401/422): `{ "success": false, "message": "...", "error_code": "UNAUTHENTICATED" }`

- **POST `/api/v1/logout`**
  - Headers: `Authorization: Bearer <token>`
  - Response (200): `{ "success": true, "message": "Logged out successfully" }`

- **GET `/api/v1/me`**
  - Headers: `Authorization: Bearer <token>`
  - Response (200): `{ "success": true, "data": { "id": 1, "name": "...", "roles": [...] } }`

---

## 4. Verification & Acceptance Criteria

1. **Successful Login**: Entering valid credentials stores token in `localStorage`, updates `useAuth` context, and redirects to `/dashboard`.
2. **Invalid Credentials**: Entering wrong credentials shows localized error message without crashing or exposing raw stack trace.
3. **Session Persistence**: Refreshing the browser preserves authentication state via token check against `/api/v1/me`.
4. **Logout**: Clicking Logout calls `POST /api/v1/logout`, clears token, and redirects to `/login`.
5. **RTL Verification**: Viewing `/ar/login` mirrors input fields and text right-to-left seamlessly.
