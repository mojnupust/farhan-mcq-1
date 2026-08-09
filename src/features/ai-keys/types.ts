export type AiProviderName =
  | "MISTRAL"
  | "ANTHROPIC"
  | "GEMINI"
  | "OPENAI"
  | "OMNIROUTE";

export interface AiProviderKey {
  id: string;
  provider: AiProviderName;
  label: string | null;
  keyPreview: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateAiProviderKeyInput {
  provider: AiProviderName;
  key: string;
  label?: string;
}
