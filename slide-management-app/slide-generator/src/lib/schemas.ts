import { z } from "zod";

export const loginSchema = z.object({
  mobile: z.string().min(6, { message: "Enter a valid mobile number" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
