import { apiClient } from "@/lib/api-client";

export type BroadcastPlatformName =
  | "TELEGRAM_GROUP"
  | "TELEGRAM_CHANNEL"
  | "FACEBOOK_PAGE"
  | "WHATSAPP";

export interface AutomationRule {
  id: string;
  name: string;
  kind: "RANDOM_QUESTIONS";
  platforms: BroadcastPlatformName[];
  questionCount: number;
  intervalMinutes: number;
  isActive: boolean;
  repeatJobKey: string | null;
  lastRunAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAutomationRuleInput {
  name: string;
  platforms: BroadcastPlatformName[];
  questionCount?: number;
  intervalMinutes?: number;
  isActive?: boolean;
}

export const automationRulesApi = {
  list: () =>
    apiClient
      .get<{ data: AutomationRule[] }>("/v1/broadcast-automation/rules")
      .then((r) => r.data),
  create: (input: CreateAutomationRuleInput) =>
    apiClient
      .post<{ data: AutomationRule }>("/v1/broadcast-automation/rules", input)
      .then((r) => r.data),
  update: (id: string, input: Partial<CreateAutomationRuleInput>) =>
    apiClient
      .patch<{ data: AutomationRule }>(`/v1/broadcast-automation/rules/${id}`, input)
      .then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/v1/broadcast-automation/rules/${id}`),
  runNow: (id: string) =>
    apiClient
      .post<{ data: { sent: number; failed: number } }>(
        `/v1/broadcast-automation/rules/${id}/run-now`,
        {},
      )
      .then((r) => r.data),
};
