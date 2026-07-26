import { z } from "zod";

export const patientSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional().nullable(),
  last_name: z.string().min(1, "Last name is required"),
  gender: z.enum(["male", "female", "other"], {
    errorMap: () => ({ message: "Please select gender" }),
  }),
  birth_date: z.string().min(1, "Date of birth is required"),
  national_id: z.string().min(1, "National ID is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  address: z.string().optional().nullable(),
  registered_branch_id: z.coerce.number().optional(),
});
