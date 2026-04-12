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

export interface AuthService {
  sendOtp(data: SendOtpInput): Promise<SendOtpResponse>;
  verifyOtp(data: VerifyOtpInput): Promise<VerifyOtpResponse>;
  register(data: RegisterInput): Promise<AuthResponse>;
  login(data: LoginInput): Promise<AuthResponse>;
  resetPassword(data: ResetPasswordInput): Promise<{ message: string }>;
  getMe(): Promise<AuthUser>;
  logout(): void;
}
