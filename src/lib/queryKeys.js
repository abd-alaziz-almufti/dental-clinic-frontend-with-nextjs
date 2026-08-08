/**
 * Centralized query key factory.
 * Ensures all keys are consistent and invalidation is predictable.
 * Usage: queryKeys.patients.list({ page: 1, search: '' })
 */
export const queryKeys = {
  // Appointments
  appointments: {
    all: ["appointments"],
    list: (params) => ["appointments", "list", params],
    detail: (id) => ["appointments", "detail", id],
  },

  // Patients
  patients: {
    all: ["patients"],
    list: (params) => ["patients", "list", params],
    detail: (id) => ["patients", "detail", id],
  },

  // Visits
  visits: {
    all: ["visits"],
    list: (params) => ["visits", "list", params],
    detail: (id) => ["visits", "detail", id],
  },

  // Billing / Invoices
  invoices: {
    all: ["invoices"],
    list: (params) => ["invoices", "list", params],
    detail: (id) => ["invoices", "detail", id],
  },

  // Dashboard
  dashboard: {
    todayAppointments: (date) => ["dashboard", "appointments", date],
    patientsSummary: () => ["dashboard", "patients"],
  },

  // Inventory
  inventory: {
    all: ["inventory"],
    items: (params) => ["inventory", "items", params],
    purchases: (params) => ["inventory", "purchases", params],
  },

  // Users & Staff
  users: {
    all: ["users"],
    list: (params) => ["users", "list", params],
  },

  // Branches / Settings
  branches: {
    all: ["branches"],
    list: () => ["branches", "list"],
    detail: (id) => ["branches", "detail", id],
  },

  // Doctors / Services / Specialties (for selects)
  doctors: {
    all: ["doctors"],
    list: (params) => ["doctors", "list", params],
  },
  services: {
    all: ["services"],
    list: (params) => ["services", "list", params],
  },
};
