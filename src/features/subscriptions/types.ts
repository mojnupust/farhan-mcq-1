export interface PackageDto {
  id: string;
  name: string;
  durationDays: number;
  price: number;
  discount: number;
  description: string | null;
  liveQuota: number | null;
  archiveQuota: number | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface PaymentTransactionDto {
  id: string;
  userId: string;
  packageId: string;
  amount: number;
  paymentMethod: string;
  mobileNumber: string;
  transactionId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNote: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  createdAt: string;
  packageName: string | null;
  userName: string | null;
  userMobile: string | null;
}

export interface UserPackageDto {
  id: string;
  userId: string;
  packageId: string;
  startDate: string;
  endDate: string;
  liveUsed: number;
  archiveUsed: number;
  isActive: boolean;
  createdAt: string;
  packageName: string | null;
  packageLiveQuota: number | null;
  packageArchiveQuota: number | null;
}

export interface SubmitPaymentInput {
  packageId: string;
  amount: number;
  paymentMethod: "BKASH" | "NAGAD" | "ROCKET";
  mobileNumber: string;
  transactionId: string;
}

export interface CreatePackageInput {
  name: string;
  durationDays: number;
  price: number;
  discount?: number;
  description?: string;
  liveQuota?: number;
  archiveQuota?: number;
  sortOrder?: number;
}

export interface UpdatePackageInput {
  name?: string;
  durationDays?: number;
  price?: number;
  discount?: number;
  description?: string;
  liveQuota?: number | null;
  archiveQuota?: number | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface ReviewTransactionInput {
  adminNote?: string;
}

export interface UserProfileDto {
  id: string;
  mobile: string;
  name: string | null;
  photo: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  activePackage: UserPackageDto | null;
}

export interface UpdateProfileInput {
  name?: string;
  photo?: string;
}
