import { apiAuthService } from "./services/auth.api";
import { mockAuthService } from "./services/auth.mock";
import type { AuthService } from "./services/auth.service";

export const authService: AuthService =
  process.env.USE_MOCKS === "true" ? mockAuthService : apiAuthService;

export { PasswordResetDialog } from "./components/password-reset-dialog";
export {
  RegistrationClosedDialog,
  RegistrationClosedNotice,
  SUPPORT_MOBILE,
  SUPPORT_WHATSAPP_HREF,
} from "./components/registration-closed-notice";
export { AuthProvider, useAuth } from "./components/auth-provider";
export * from "./schemas";
export type { AuthService } from "./services/auth.service";
export * from "./types";
