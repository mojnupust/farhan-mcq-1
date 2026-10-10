import { ApiError, apiClient } from "@/lib/api-client";

import type { CheckInResult, StreakStatus } from "../types";

export class ActivityRequiredError extends Error {
  constructor(public readonly progress: StreakStatus["gate"]["progress"]) {
    super("ACTIVITY_REQUIRED");
    this.name = "ActivityRequiredError";
  }
}

export const streakService = {
  async getStatus(): Promise<StreakStatus> {
    const res = await apiClient.get<{ data: StreakStatus }>("/v1/streak/status");
    return res.data;
  },

  async checkIn(): Promise<CheckInResult> {
    try {
      const res = await apiClient.post<{ data: CheckInResult }>(
        "/v1/streak/check-in",
        {},
      );
      return res.data;
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        const status = await streakService.getStatus();
        throw new ActivityRequiredError(status.gate.progress);
      }
      throw err;
    }
  },
};
