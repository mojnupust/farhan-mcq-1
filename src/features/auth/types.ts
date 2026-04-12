export interface AuthUser {
  id: string;
  mobile: string;
  name: string | null;
  photo: string | null;
  role: "USER" | "ADMIN";
  isActive: boolean;
  createdAt: string;
}

export interface SendOtpInput {
  mobile: string;
}

export interface VerifyOtpInput {
  mobile: string;
  code: string;
}

export interface RegisterInput {
  mobile: string;
  password: string;
}

export interface LoginInput {
  mobile: string;
  password: string;
}

export interface ResetPasswordInput {
  mobile: string;
  password: string;
}

export interface SendOtpResponse {
  message: string;
  isNewUser: boolean;
}

export interface VerifyOtpResponse {
  verified: boolean;
  isNewUser: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}
