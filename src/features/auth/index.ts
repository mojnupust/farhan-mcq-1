import { apiAuthService } from "./services/auth.api";
import { mockAuthService } from "./services/auth.mock";
import type { AuthService } from "./services/auth.service";

export const authService: AuthService =
  process.env.USE_MOCKS === "true" ? mockAuthService : apiAuthService;

export { AuthProvider, useAuth } from "./components/auth-provider";
export * from "./schemas";
export type { AuthService } from "./services/auth.service";
export * from "./types";
