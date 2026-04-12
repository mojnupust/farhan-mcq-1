"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Notification } from "@/features/notifications";
import { notificationService } from "@/features/notifications";
import { Bell, Check } from "lucide-react";
import { useEffect, useState } from "react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationService
      .getForUser(50)
      .then(setNotifications)
      .catch(console.error)
      .finally(() => setLoading(false));
    notificationService
      .getUnreadCount()
      .then(setUnreadCount)
      .catch(console.error);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
          <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              নোটিফিকেশন
            </h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} টি অপঠিত নোটিফিকেশন`
                : "সকল নোটিফিকেশন পঠিত"}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              লোড হচ্ছে...
            </p>
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Bell className="mx-auto size-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  কোনো নোটিফিকেশন নেই
                </p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((n) => (
              <Card
                key={n.id}
                className={
                  n.isRead ? "opacity-70" : "border-l-4 border-l-primary"
                }
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{n.title}</CardTitle>
                      {!n.isRead && (
                        <Badge variant="default" className="text-[10px]">
                          নতুন
                        </Badge>
                      )}
                    </div>
                    {!n.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(n.id)}
                        className="shrink-0"
                      >
                        <Check className="size-4 mr-1" />
                        পঠিত
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{n.content}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatDate(n.createdAt)}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
  );
}
