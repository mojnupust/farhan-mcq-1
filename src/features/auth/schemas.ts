import { z } from "zod";

const bdMobileRegex = /^01[3-9]\d{8}$/;

export const sendOtpSchema = z.object({
  mobile: z
    .string()
    .length(11, "মোবাইল নম্বর ১১ ডিজিটের হতে হবে")
    .regex(bdMobileRegex, "সঠিক বাংলাদেশি মোবাইল নম্বর দিন"),
});

export const verifyOtpSchema = z.object({
  mobile: z
    .string()
    .length(11, "মোবাইল নম্বর ১১ ডিজিটের হতে হবে")
    .regex(bdMobileRegex, "সঠিক বাংলাদেশি মোবাইল নম্বর দিন"),
  code: z
    .string()
    .length(4, "OTP ৪ ডিজিটের হতে হবে")
    .regex(/^\d{4}$/, "OTP শুধু সংখ্যা হতে হবে"),
});

export const setPasswordSchema = z
  .object({
    mobile: z.string(),
    password: z.string().min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "পাসওয়ার্ড মিলছে না",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  mobile: z
    .string()
    .length(11, "মোবাইল নম্বর ১১ ডিজিটের হতে হবে")
    .regex(bdMobileRegex, "সঠিক বাংলাদেশি মোবাইল নম্বর দিন"),
  password: z.string().min(1, "পাসওয়ার্ড দিন"),
});
