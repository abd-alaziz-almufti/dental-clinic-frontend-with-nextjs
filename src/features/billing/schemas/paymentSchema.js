import { z } from "zod";

export const paymentSchema = z.object({
  amount: z.coerce.number().min(0.01, "Amount must be greater than zero"),
  payment_method: z.enum(["cash", "card", "bank_transfer", "insurance", "other"], {
    errorMap: () => ({ message: "Please select a payment method" }),
  }),
  payment_date: z.string().min(1, "Payment date is required"),
  notes: z.string().optional().nullable(),
});
