import { z } from "zod";

export const submitPaymentSchema = z.object({
  packageId: z.string().min(1, "প্যাকেজ নির্বাচন করুন"),
  amount: z.number().positive("পরিমাণ প্রয়োজন"),
  paymentMethod: z.enum(["BKASH", "NAGAD", "ROCKET"]),
  mobileNumber: z.string().min(11, "সঠিক মোবাইল নম্বর দিন").max(20),
  transactionId: z.string().min(1, "ট্রানজাকশন আইডি প্রয়োজন").max(50),
});

export const createPackageSchema = z.object({
  name: z.string().min(1, "নাম প্রয়োজন").max(200),
  durationDays: z.number().int().positive("দিনের সংখ্যা প্রয়োজন"),
  price: z.number().min(0, "মূল্য প্রয়োজন"),
  discount: z.number().min(0).optional(),
  description: z.string().max(2000).optional(),
  liveQuota: z.number().int().positive().optional(),
  archiveQuota: z.number().int().positive().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const updatePackageSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  durationDays: z.number().int().positive().optional(),
  price: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  description: z.string().max(2000).optional(),
  liveQuota: z.number().int().positive().nullable().optional(),
  archiveQuota: z.number().int().positive().nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const reviewTransactionSchema = z.object({
  adminNote: z.string().max(1000).optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  photo: z.string().max(500).optional(),
});
