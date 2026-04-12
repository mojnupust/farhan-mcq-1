import { apiClient } from "@/lib/api-client";
import type { UserProfileDto } from "../types";
import type { ProfileService } from "./profile.service";

export const apiProfileService: ProfileService = {
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
};
