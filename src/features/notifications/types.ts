export interface Notification {
  id: string;
  title: string;
  content: string;
  type: "PUBLIC" | "SPECIFIC";
  targetUserId: string | null;
  isActive: boolean;
  createdAt: string;
  isRead?: boolean;
}

export interface CreateNotificationInput {
  title: string;
  content: string;
  type: "PUBLIC" | "SPECIFIC";
  targetUserId?: string;
}

export interface UpdateNotificationInput {
  title?: string;
  content?: string;
  type?: "PUBLIC" | "SPECIFIC";
  targetUserId?: string;
  isActive?: boolean;
}
