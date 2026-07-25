# Technical Implementation Plan: Phase 1 — Authentication & Authorization

**Spec Ref**: [`specs/001-authentication/spec.md`](spec.md)  
**PRD Ref**: [`PRD_LuminaDental_Frontend.md`](../../PRD_LuminaDental_Frontend.md)  
**Constitution Ref**: [`.specify/memory/constitution.md`](../../.specify/memory/constitution.md)  

---

## Constitution Check

- **Article I (API Contract)**: All auth requests pass through `src/config/axios.js`.
- **Article II (Vertical Slices)**: Complete auth slice shipped (UI + API + State + Guards + i18n).
- **Article III (Error Codes)**: Frontend logic branches on `error_code` (e.g. `UNAUTHENTICATED`), displaying translated error strings.
- **Article IV (Role-Based UI)**: Single `useAuth()` hook provides `can(role)` utility.
- **Article V (Bilingual)**: Full `en` and `ar` translation keys in `messages/*.json`.
- **Article VI (Logical CSS)**: `ms-*`/`me-*`/`ps-*`/`pe-*` used for layout spacing.

---

## Proposed Changes

### Component 1: Auth Context & Services
- [NEW] `src/context/AuthContext.jsx`: Auth provider managing `token`, `user`, `isLoading`, `login`, `logout`, `can`.
- [NEW] `src/hooks/useAuth.js`: Custom hook exposing `useContext(AuthContext)`.
- [NEW] `src/services/authService.js`: Encapsulates `login()`, `logout()`, `getMe()` API calls using `api` instance.

### Component 2: Login Page & UI
- [NEW] `src/app/[locale]/login/page.jsx`: Login page component.
- [NEW] `src/features/auth/components/LoginForm.jsx`: Form with React Hook Form + Zod schema.
- [NEW] `src/features/auth/schemas/loginSchema.js`: Zod validation schema.

### Component 3: Route Guard Integration
- [MODIFY] `src/middleware.js`: Add locale + auth token presence check logic for protected vs public routes.
- [MODIFY] `src/app/[locale]/layout.jsx`: Wrap `NextIntlClientProvider` with `AuthProvider`.

---

## Verification Plan

### Automated Build Check
- Run `npm run build` to ensure no compile or type errors.

### Manual Verification
1. Login with correct credentials against backend (`POST http://localhost:8000/api/v1/login`).
2. Login with invalid password → verify localized error toast/message.
3. Test logout → verify token removal and redirect to `/login`.
4. Switch language to Arabic (`/ar/login`) → verify RTL input alignments.
