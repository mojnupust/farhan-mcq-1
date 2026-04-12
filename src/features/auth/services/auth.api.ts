import { apiClient } from "@/lib/api-client";
import type {
  AuthResponse,
  AuthUser,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  SendOtpInput,
  SendOtpResponse,
  VerifyOtpInput,
  VerifyOtpResponse,
} from "../types";
import type { AuthService } from "./auth.service";

export const apiAuthService: AuthService = {
  async sendOtp(data: SendOtpInput) {
    const res = await apiClient.post<{ data: SendOtpResponse }>(
      "/v1/auth/send-otp",
      data,
    );
    return res.data;
  },

  async verifyOtp(data: VerifyOtpInput) {
    const res = await apiClient.post<{ data: VerifyOtpResponse }>(
      "/v1/auth/verify-otp",
      data,
    );
    return res.data;
  },

  async register(data: RegisterInput) {
    const res = await apiClient.post<{ data: AuthResponse }>(
      "/v1/auth/register",
      data,
    );
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", res.data.token);
    }
    return res.data;
  },

  async login(data: LoginInput) {
    const res = await apiClient.post<{ data: AuthResponse }>(
      "/v1/auth/login",
      data,
    );
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", res.data.token);
    }
    return res.data;
  },

  async resetPassword(data: ResetPasswordInput) {
    const res = await apiClient.post<{ data: { message: string } }>(
      "/v1/auth/reset-password",
      data,
    );
    return res.data;
  },

  async getMe() {
    const res = await apiClient.get<{ data: AuthUser }>("/v1/auth/me");
    return res.data;
  },

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  },
};
