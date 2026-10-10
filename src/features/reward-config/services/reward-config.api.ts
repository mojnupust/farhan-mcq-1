import { apiClient } from "@/lib/api-client";

import type { RewardConfig, UpdateRewardConfigInput } from "../types";

export const rewardConfigService = {
  async get(): Promise<RewardConfig> {
    const res = await apiClient.get<{ data: RewardConfig }>(
      "/v1/reward-config",
    );
    return res.data;
  },

  async update(input: UpdateRewardConfigInput): Promise<RewardConfig> {
    const res = await apiClient.patch<{ data: RewardConfig }>(
      "/v1/reward-config",
      input,
    );
    return res.data;
  },
};
