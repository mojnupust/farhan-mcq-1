"use client";

import { Bell, X } from "lucide-react";
import { useState } from "react";
import type { Notification } from "../types";

interface NotificationBannerProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
}

export function NotificationBanner({
  notifications,
  onMarkAsRead,
}: NotificationBannerProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = notifications.filter(
    (n) => !dismissed.has(n.id) && !n.isRead,
  );

  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      {visible.map((notification) => (
        <div
          key={notification.id}
          className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm dark:border-blue-800 dark:bg-blue-950"
        >
          <Bell className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-blue-900 dark:text-blue-100">
              {notification.title}
            </p>
            <p className="mt-0.5 text-blue-700 dark:text-blue-300">
              {notification.content}
            </p>
          </div>
          <button
            onClick={() => {
              setDismissed((prev) => new Set(prev).add(notification.id));
              onMarkAsRead?.(notification.id);
            }}
            className="shrink-0 rounded p-1 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900"
          >
            <X className="size-4" />
            <span className="sr-only">বন্ধ করুন</span>
          </button>
        </div>
      ))}
    </div>
  );
}
