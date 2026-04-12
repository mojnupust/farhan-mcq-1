import type {
  CreatePackageInput,
  PackageDto,
  PaymentTransactionDto,
  ReviewTransactionInput,
  SubmitPaymentInput,
  UpdatePackageInput,
  UpdateProfileInput,
  UserPackageDto,
  UserProfileDto,
} from "../types";

export interface SubscriptionService {
  // Public
  getPackages(): Promise<PackageDto[]>;

  // Member
  submitPayment(data: SubmitPaymentInput): Promise<PaymentTransactionDto>;
  getMyTransactions(): Promise<PaymentTransactionDto[]>;
  deleteTransaction(id: string): Promise<void>;
  getMyPackage(): Promise<UserPackageDto | null>;

  // Profile
  getProfile(): Promise<UserProfileDto>;
  updateProfile(data: UpdateProfileInput): Promise<UserProfileDto>;

  // Admin: Packages
  getAdminPackages(): Promise<PackageDto[]>;
  createPackage(data: CreatePackageInput): Promise<PackageDto>;
  updatePackage(id: string, data: UpdatePackageInput): Promise<PackageDto>;
  deletePackage(id: string): Promise<void>;

  // Admin: Transactions
  getAllTransactions(status?: string): Promise<PaymentTransactionDto[]>;
  approveTransaction(
    id: string,
    data: ReviewTransactionInput,
  ): Promise<PaymentTransactionDto>;
  rejectTransaction(
    id: string,
    data: ReviewTransactionInput,
  ): Promise<PaymentTransactionDto>;
}
