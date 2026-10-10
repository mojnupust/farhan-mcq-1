import { apiClient } from "@/lib/api-client";

import type {
  CreateWithdrawalInput,
  PaginatedWithdrawals,
  WithdrawalEligibility,
  WithdrawalRequest,
  WithdrawalStatus,
} from "../types";

export const withdrawalService = {
  async eligibility(): Promise<WithdrawalEligibility> {
    const res = await apiClient.get<{ data: WithdrawalEligibility }>(
      "/v1/withdrawals/eligibility",
    );
    return res.data;
  },

  async listMine(page = 1): Promise<PaginatedWithdrawals> {
    const res = await apiClient.get<{ data: PaginatedWithdrawals }>(
      `/v1/withdrawals/me?page=${page}&pageSize=10`,
    );
    return res.data;
  },

  async request(input: CreateWithdrawalInput): Promise<WithdrawalRequest> {
    const res = await apiClient.post<{ data: WithdrawalRequest }>(
      "/v1/withdrawals",
      input,
    );
    return res.data;
  },

  async listAdmin(status?: WithdrawalStatus | "all", page = 1) {
    const params = new URLSearchParams({ page: String(page), pageSize: "30" });
    if (status && status !== "all") params.set("status", status);
    const res = await apiClient.get<{ data: PaginatedWithdrawals }>(
      `/v1/withdrawals?${params.toString()}`,
    );
    return res.data;
  },

  async approve(id: string, adminNote?: string) {
    const res = await apiClient.post<{ data: WithdrawalRequest }>(
      `/v1/withdrawals/${id}/approve`,
      { adminNote },
    );
    return res.data;
  },

  async reject(id: string, adminNote?: string) {
    const res = await apiClient.post<{ data: WithdrawalRequest }>(
      `/v1/withdrawals/${id}/reject`,
      { adminNote },
    );
    return res.data;
  },

  async pay(id: string, paidTrxId: string, adminNote?: string) {
    const res = await apiClient.post<{ data: WithdrawalRequest }>(
      `/v1/withdrawals/${id}/pay`,
      { paidTrxId, adminNote },
    );
    return res.data;
  },
};
