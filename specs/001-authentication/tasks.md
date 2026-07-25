# Implementation Tasks: Phase 1 — Authentication & Authorization

**Plan Ref**: [`plan.md`](plan.md)  
**Spec Ref**: [`spec.md`](spec.md)  

---

## Tasks

- [x] **Task 1: Auth Service & API Layer**
  - Create `src/services/authService.js` with `login(email, password)`, `logout()`, and `getMe()` methods calling backend `/api/v1/...` via Axios.

- [x] **Task 2: Auth Context & `useAuth` Hook**
  - Create `src/context/AuthContext.jsx` with token/user persistence and role checking (`can`).
  - Create `src/hooks/useAuth.js`.
  - Wrap `NextIntlClientProvider` with `AuthProvider` in `src/app/[locale]/layout.jsx`.

- [x] **Task 3: Login Validation Schema & Form Component**
  - Create `src/features/auth/schemas/loginSchema.js` using Zod.
  - Create `src/features/auth/components/LoginForm.jsx` with React Hook Form, Input, Button components and i18n copy.

- [x] **Task 4: Login Page & Route Guards**
  - Create `src/app/[locale]/login/page.jsx` with Lumina Dental visual styling.
  - Update `src/middleware.js` for locale and public vs protected route handling.

- [x] **Task 5: Build & Verification**
  - Run `npm run build` to confirm zero build errors.
