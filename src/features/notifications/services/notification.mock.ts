import type { Notification } from "../types";
import type { NotificationService } from "./notification.service";

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "প্ল্যাটফর্মে স্বাগতম! 🎉",
    content: "MCQ প্ল্যাটফর্মে আপনাকে স্বাগতম। পরীক্ষা দিতে শুরু করুন।",
    type: "PUBLIC",
    targetUserId: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    isRead: false,
  },
  {
    id: "2",
    title: "নতুন প্রশ্নসেট যোগ হয়েছে",
    content: "প্রাইমারি শিক্ষক নিয়োগ পরীক্ষার নতুন মডেল টেস্ট যোগ হয়েছে।",
    type: "PUBLIC",
    targetUserId: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    isRead: false,
  },
  {
    id: "3",
    title: "আপডেট: বিসিএস প্রস্তুতি কোর্স",
    content: "৪৬তম বিসিএস প্রস্তুতির জন্য নতুন প্রশ্ন ব্যাংক আপলোড করা হয়েছে।",
    type: "PUBLIC",
    targetUserId: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    isRead: true,
  },
];

export const mockNotificationService: NotificationService = {
  async getForUser(limit = 3) {
    return mockNotifications.slice(0, limit);
  },
  async getUnreadCount() {
    return mockNotifications.filter((n) => !n.isRead).length;
  },
  async markAsRead() {
    // no-op
  },
  async getAll() {
    return mockNotifications;
  },
  async create(input) {
    return {
      id: String(mockNotifications.length + 1),
      title: input.title,
      content: input.content,
      type: input.type,
      targetUserId: input.targetUserId ?? null,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
  },
  async update(id, input) {
    const n = mockNotifications.find((n) => n.id === id);
    if (!n) throw new Error("Notification not found");
    return { ...n, ...input };
  },
  async delete() {
    // no-op
  },
  async bulkUpsert(items) {
    return items.map((item, i) => ({
      id: item.id ?? String(Date.now() + i),
      title: item.title,
      content: item.content,
      type: item.type,
      targetUserId: item.targetUserId ?? null,
      isActive: item.isActive ?? true,
      createdAt: new Date().toISOString(),
    }));
  },
  async bulkDelete() {
    // no-op
  },
};
