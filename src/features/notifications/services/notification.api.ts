import { apiClient } from "@/lib/api-client";
import type {
  BulkUpsertNotificationItem,
  CreateNotificationInput,
  Notification,
  UpdateNotificationInput,
} from "../types";
import type { NotificationService } from "./notification.service";

export const apiNotificationService: NotificationService = {
  async getForUser(limit = 3) {
    const res = await apiClient.get<{ data: Notification[] }>(
      `/v1/notifications?limit=${limit}`,
    );
    return res.data;
  },
  async getUnreadCount() {
    const res = await apiClient.get<{ data: { count: number } }>(
      "/v1/notifications/unread-count",
    );
    return res.data.count;
  },
  async markAsRead(id: string) {
    await apiClient.post(`/v1/notifications/${id}/read`, {});
  },
  async getAll() {
    const res = await apiClient.get<{ data: Notification[] }>(
      "/v1/notifications/admin",
    );
    return res.data;
  },
  async create(input: CreateNotificationInput) {
    const res = await apiClient.post<{ data: Notification }>(
      "/v1/notifications/admin",
      input,
    );
    return res.data;
  },
  async update(id: string, input: UpdateNotificationInput) {
    const res = await apiClient.patch<{ data: Notification }>(
      `/v1/notifications/admin/${id}`,
      input,
    );
    return res.data;
  },
  async delete(id: string) {
    await apiClient.delete(`/v1/notifications/admin/${id}`);
  },
  async bulkUpsert(items: BulkUpsertNotificationItem[]) {
    const res = await apiClient.post<{ data: Notification[] }>(
      "/v1/notifications/admin/bulk-upsert",
      { items },
    );
    return res.data;
  },
  async bulkDelete(ids: string[]) {
    await apiClient.delete("/v1/notifications/admin/bulk-delete", { ids });
  },
};
