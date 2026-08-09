import { apiClient } from "@/lib/api-client";
import type { AiProviderKey, CreateAiProviderKeyInput } from "../types";

export const aiKeysApi = {
  list: () =>
    apiClient
      .get<{ data: AiProviderKey[] }>("/v1/ai-provider-keys")
      .then((r) => r.data),
  create: (input: CreateAiProviderKeyInput) =>
    apiClient
      .post<{ data: AiProviderKey }>("/v1/ai-provider-keys", input)
      .then((r) => r.data),
  toggleActive: (id: string, isActive: boolean) =>
    apiClient
      .patch<{
        data: AiProviderKey;
      }>(`/v1/ai-provider-keys/${id}`, { isActive })
      .then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/v1/ai-provider-keys/${id}`),
};
