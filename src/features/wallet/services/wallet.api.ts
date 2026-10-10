import { apiClient } from "@/lib/api-client";

import type { WalletAccount, WalletLedgerEntry } from "../types";

export const walletService = {
  async getMine(): Promise<WalletAccount> {
    const res = await apiClient.get<{ data: WalletAccount }>("/v1/wallet/me");
    return res.data;
  },

  async getLedger(page = 1, pageSize = 20) {
    const res = await apiClient.get<{
      data: {
        data: WalletLedgerEntry[];
        page: number;
        pageSize: number;
        total: number;
      };
    }>(`/v1/wallet/me/ledger?page=${page}&pageSize=${pageSize}`);
    return res.data;
  },
};
