import type {
  BulkUpsertNotificationItem,
  CreateNotificationInput,
  Notification,
  UpdateNotificationInput,
} from "../types";

export interface NotificationService {
  getForUser(limit?: number): Promise<Notification[]>;
  getUnreadCount(): Promise<number>;
  markAsRead(id: string): Promise<void>;
  // Admin
  getAll(): Promise<Notification[]>;
  create(input: CreateNotificationInput): Promise<Notification>;
  update(id: string, input: UpdateNotificationInput): Promise<Notification>;
  delete(id: string): Promise<void>;
  bulkUpsert(items: BulkUpsertNotificationItem[]): Promise<Notification[]>;
  bulkDelete(ids: string[]): Promise<void>;
}
