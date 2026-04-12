import type { UpdateProfileInput, UserProfileDto } from "../types";

export interface ProfileService {
  getProfile(): Promise<UserProfileDto>;
  updateProfile(data: UpdateProfileInput): Promise<UserProfileDto>;
}
