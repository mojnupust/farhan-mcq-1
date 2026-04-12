import { apiClient } from "@/lib/api-client";
import type {
  PackageDto,
  PaymentTransactionDto,
  UserPackageDto,
  UserProfileDto,
} from "../types";
import type { SubscriptionService } from "./subscription.service";

export const apiSubscriptionService: SubscriptionService = {
  // Public
  async getPackages() {
    const res = await apiClient.get<{ data: PackageDto[] }>("/v1/packages");
    return res.data;
  },

  // Member
  async submitPayment(data) {
    const res = await apiClient.post<{ data: PaymentTransactionDto }>(
      "/v1/packages/payments",
      data,
    );
    return res.data;
  },
  async getMyTransactions() {
    const res = await apiClient.get<{ data: PaymentTransactionDto[] }>(
      "/v1/packages/payments",
    );
    return res.data;
  },
  async deleteTransaction(id) {
    await apiClient.delete(`/v1/packages/payments/${id}`);
  },
  async getMyPackage() {
    const res = await apiClient.get<{ data: UserPackageDto | null }>(
      "/v1/packages/my-package",
    );
    return res.data;
  },

  // Profile
  async getProfile() {
    const res = await apiClient.get<{ data: UserProfileDto }>(
      "/v1/packages/profile",
    );
    return res.data;
  },
  async updateProfile(data) {
    const res = await apiClient.patch<{ data: UserProfileDto }>(
      "/v1/packages/profile",
      data,
    );
    return res.data;
  },

  // Admin: Packages
  async getAdminPackages() {
    const res = await apiClient.get<{ data: PackageDto[] }>(
      "/v1/packages/admin/list?activeOnly=false",
    );
    return res.data;
  },
  async createPackage(data) {
    const res = await apiClient.post<{ data: PackageDto }>(
      "/v1/packages/admin",
      data,
    );
    return res.data;
  },
  async updatePackage(id, data) {
    const res = await apiClient.patch<{ data: PackageDto }>(
      `/v1/packages/admin/${id}`,
      data,
    );
    return res.data;
  },
  async deletePackage(id) {
    await apiClient.delete(`/v1/packages/admin/${id}`);
  },

  // Admin: Transactions
  async getAllTransactions(status) {
    const query = status ? `?status=${status}` : "";
    const res = await apiClient.get<{ data: PaymentTransactionDto[] }>(
      `/v1/packages/admin/transactions${query}`,
    );
    return res.data;
  },
  async approveTransaction(id, data) {
    const res = await apiClient.post<{ data: PaymentTransactionDto }>(
      `/v1/packages/admin/transactions/${id}/approve`,
      data,
    );
    return res.data;
  },
  async rejectTransaction(id, data) {
    const res = await apiClient.post<{ data: PaymentTransactionDto }>(
      `/v1/packages/admin/transactions/${id}/reject`,
      data,
    );
    return res.data;
  },
};
