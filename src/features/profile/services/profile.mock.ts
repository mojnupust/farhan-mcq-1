import type { UserProfileDto } from "../types";
import type { ProfileService } from "./profile.service";

const mockProfile: UserProfileDto = {
  id: "1",
  mobile: "01700000001",
  name: "Rahim Uddin",
  photo: null,
  role: "MEMBER",
  isActive: true,
  createdAt: new Date().toISOString(),
  activePackage: null,
};

export const mockProfileService: ProfileService = {
  async getProfile() {
    return mockProfile;
  },
  async updateProfile(data) {
    Object.assign(mockProfile, data);
    return mockProfile;
  },
};
