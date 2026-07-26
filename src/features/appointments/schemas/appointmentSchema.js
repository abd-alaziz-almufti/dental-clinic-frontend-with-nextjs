import { z } from "zod";

export const appointmentSchema = z.object({
  patient_id: z.coerce.number().min(1, "Please select a patient"),
  doctor_profile_id: z.coerce.number().min(1, "Please select a doctor"),
  appointment_date: z.string().min(1, "Appointment date is required"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  reason: z.string().min(1, "Reason for visit is required").max(255),
  notes: z.string().optional().nullable(),
  branch_id: z.coerce.number().optional().default(1),
});
