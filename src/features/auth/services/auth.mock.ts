import type { AuthUser } from "../types";
import type { AuthService } from "./auth.service";

const mockUser: AuthUser = {
  id: "mock-user-1",
  mobile: "01712345678",
  name: "রাহিম উদ্দিন",
  photo: null,
  role: "USER",
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
};

let mockOtpCode = "1234";

export const mockAuthService: AuthService = {
  async sendOtp() {
    mockOtpCode = "1234";
    return { message: "OTP sent successfully", isNewUser: true };
  },

  async verifyOtp(data) {
    if (data.code !== mockOtpCode) {
      throw new Error("Invalid OTP");
    }
    return { verified: true, isNewUser: true };
  },

  async register() {
    const token = "mock-jwt-token";
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
    }
    return { user: mockUser, token };
  },

  async login() {
    const token = "mock-jwt-token";
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
    }
    return { user: mockUser, token };
  },

  async resetPassword() {
    return { message: "Password reset successfully" };
  },

  async getMe() {
    return mockUser;
  },

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  },
};
