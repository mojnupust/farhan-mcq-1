import { apiClient } from "@/lib/api-client";

export type BroadcastContentTypeName =
  | "QUESTION"
  | "QUESTION_SET"
  | "PDF"
  | "JOB_CIRCULAR"
  | "MOTIVATIONAL"
  | "STUDY_TIP"
  | "NOTICE"
  | "OFFER"
  | "CUSTOM"
  | "SLIDE_IMAGE";

export type BroadcastStatusName = "DRAFT" | "SENDING" | "SENT" | "FAILED";

export type BroadcastPlatformName =
  | "TELEGRAM_GROUP"
  | "TELEGRAM_CHANNEL"
  | "FACEBOOK_PAGE"
  | "WHATSAPP";

export interface BroadcastLog {
  id: string;
  contentType: BroadcastContentTypeName;
  platforms: BroadcastPlatformName[];
  contentText: string | null;
  mediaUrl: string | null;
  status: BroadcastStatusName;
  errorMessage: string | null;
  aiProvider: string | null;
  aiModel: string | null;
  createdAt: string;
  sentAt: string | null;
}

export interface BroadcastLogListResponse {
  data: BroadcastLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const broadcastLogsApi = {
  list: (params?: Record<string, string | number | undefined>) => {
    const qs = new URLSearchParams();
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== "") qs.set(k, String(v));
      }
    }
    const q = qs.toString();
    return apiClient
      .get<BroadcastLogListResponse>(`/v1/broadcasts${q ? `?${q}` : ""}`)
      .then((r) => r);
  },
};
