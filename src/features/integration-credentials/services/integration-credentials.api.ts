import { apiClient } from "@/lib/api-client";

export type BroadcastPlatformName =
  | "TELEGRAM_GROUP"
  | "TELEGRAM_CHANNEL"
  | "FACEBOOK_PAGE"
  | "WHATSAPP";

export interface TelegramConfigInput {
  botToken: string;
  chatId: string;
}

export interface FacebookConfigInput {
  pageId: string;
  pageAccessToken: string;
  appId?: string;
  appSecret?: string;
}

export interface IntegrationCredential {
  id: string;
  platform: BroadcastPlatformName;
  label: string | null;
  configPreview: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIntegrationCredentialInput {
  platform: BroadcastPlatformName;
  label?: string;
  config: TelegramConfigInput | FacebookConfigInput;
}

export const integrationCredentialsApi = {
  list: () =>
    apiClient
      .get<{ data: IntegrationCredential[] }>("/v1/integration-credentials")
      .then((r) => r.data),
  create: (input: CreateIntegrationCredentialInput) =>
    apiClient
      .post<{ data: IntegrationCredential }>("/v1/integration-credentials", input)
      .then((r) => r.data),
  toggleActive: (id: string, isActive: boolean) =>
    apiClient
      .patch<{ data: IntegrationCredential }>(`/v1/integration-credentials/${id}`, {
        isActive,
      })
      .then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/v1/integration-credentials/${id}`),
};
