import { apiNotificationService } from "./services/notification.api";
import { mockNotificationService } from "./services/notification.mock";
import type { NotificationService } from "./services/notification.service";

export const notificationService: NotificationService =
  process.env.USE_MOCKS === "true"
    ? mockNotificationService
    : apiNotificationService;

export type { NotificationService } from "./services/notification.service";
export * from "./types";
