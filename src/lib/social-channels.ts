import type {
  BroadcastPlatformName,
  FacebookConfig,
  TelegramConfig,
} from "./integration-key-store";

const FB_API_VERSION = "v19.0";
const FB_BASE = `https://graph.facebook.com/${FB_API_VERSION}`;

function escHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export interface SendResult {
  platform: BroadcastPlatformName;
  chatIdOrPageId: string;
  externalId?: string;
}

async function telegramApi<T>(
  botToken: string,
  method: string,
  body: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as { ok: boolean; description?: string; result?: T };
  if (!json.ok) {
    throw new Error(json.description || `Telegram ${method} failed`);
  }
  return json.result as T;
}

export async function sendTelegramText(
  config: TelegramConfig,
  text: string,
): Promise<SendResult> {
  const result = await telegramApi<{ message_id: number }>(
    config.botToken,
    "sendMessage",
    {
      chat_id: config.chatId,
      text,
    },
  );
  return {
    platform: "TELEGRAM_GROUP",
    chatIdOrPageId: config.chatId,
    externalId: String(result.message_id),
  };
}

export async function sendTelegramPhoto(
  config: TelegramConfig,
  imageUrl: string,
  caption?: string,
  platform: BroadcastPlatformName = "TELEGRAM_GROUP",
): Promise<SendResult> {
  const result = await telegramApi<{ message_id: number }>(
    config.botToken,
    "sendPhoto",
    {
      chat_id: config.chatId,
      photo: imageUrl,
      caption: caption ? escHtml(caption) : undefined,
      parse_mode: caption ? "HTML" : undefined,
    },
  );
  return {
    platform,
    chatIdOrPageId: config.chatId,
    externalId: String(result.message_id),
  };
}

export async function sendTelegramDocument(
  config: TelegramConfig,
  fileUrl: string,
  caption?: string,
  platform: BroadcastPlatformName = "TELEGRAM_GROUP",
): Promise<SendResult> {
  const result = await telegramApi<{ message_id: number }>(
    config.botToken,
    "sendDocument",
    {
      chat_id: config.chatId,
      document: fileUrl,
      caption: caption ? escHtml(caption) : undefined,
      parse_mode: caption ? "HTML" : undefined,
    },
  );
  return {
    platform,
    chatIdOrPageId: config.chatId,
    externalId: String(result.message_id),
  };
}

export async function sendTelegramDocumentBuffer(
  config: TelegramConfig,
  buffer: Buffer,
  filename: string,
  caption?: string,
  platform: BroadcastPlatformName = "TELEGRAM_GROUP",
): Promise<SendResult> {
  const form = new FormData();
  form.append("chat_id", config.chatId);
  form.append(
    "document",
    new Blob([new Uint8Array(buffer)], { type: "application/pdf" }),
    filename,
  );
  if (caption) form.append("caption", caption);

  const res = await fetch(
    `https://api.telegram.org/bot${config.botToken}/sendDocument`,
    { method: "POST", body: form },
  );
  const json = (await res.json()) as {
    ok: boolean;
    description?: string;
    result?: { message_id: number };
  };
  if (!json.ok) {
    throw new Error(json.description || "Telegram sendDocument failed");
  }
  return {
    platform,
    chatIdOrPageId: config.chatId,
    externalId: String(json.result!.message_id),
  };
}

export async function sendTelegramPhotoBuffer(
  config: TelegramConfig,
  buffer: Buffer,
  caption?: string,
  platform: BroadcastPlatformName = "TELEGRAM_GROUP",
): Promise<SendResult> {
  const form = new FormData();
  form.append("chat_id", config.chatId);
  form.append(
    "photo",
    new Blob([new Uint8Array(buffer)], { type: "image/png" }),
    "slide.png",
  );
  if (caption) form.append("caption", caption);

  const res = await fetch(
    `https://api.telegram.org/bot${config.botToken}/sendPhoto`,
    { method: "POST", body: form },
  );
  const json = (await res.json()) as {
    ok: boolean;
    description?: string;
    result?: { message_id: number };
  };
  if (!json.ok) {
    throw new Error(json.description || "Telegram sendPhoto failed");
  }
  return {
    platform,
    chatIdOrPageId: config.chatId,
    externalId: String(json.result!.message_id),
  };
}

export async function sendFacebookText(
  config: FacebookConfig,
  message: string,
): Promise<SendResult> {
  const url = new URL(`${FB_BASE}/${config.pageId}/feed`);
  url.searchParams.set("access_token", config.pageAccessToken);
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  const json = (await res.json()) as { id?: string; error?: { message: string } };
  if (!res.ok || json.error) {
    throw new Error(json.error?.message || `Facebook feed post failed (${res.status})`);
  }
  return {
    platform: "FACEBOOK_PAGE",
    chatIdOrPageId: config.pageId,
    externalId: json.id,
  };
}

export async function sendFacebookPhoto(
  config: FacebookConfig,
  imageUrl: string,
  caption?: string,
): Promise<SendResult> {
  const url = new URL(`${FB_BASE}/${config.pageId}/photos`);
  url.searchParams.set("access_token", config.pageAccessToken);
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: imageUrl,
      caption: caption ?? "",
    }),
  });
  const json = (await res.json()) as {
    id?: string;
    post_id?: string;
    error?: { message: string };
  };
  if (!res.ok || json.error) {
    throw new Error(json.error?.message || `Facebook photo post failed (${res.status})`);
  }
  return {
    platform: "FACEBOOK_PAGE",
    chatIdOrPageId: config.pageId,
    externalId: json.post_id || json.id,
  };
}

export async function sendPlainTextToPlatform(
  platform: BroadcastPlatformName,
  config: TelegramConfig | FacebookConfig,
  text: string,
): Promise<SendResult> {
  if (platform === "FACEBOOK_PAGE") {
    return sendFacebookText(config as FacebookConfig, text);
  }
  return sendTelegramText(config as TelegramConfig, text);
}

export async function sendPhotoToPlatform(
  platform: BroadcastPlatformName,
  config: TelegramConfig | FacebookConfig,
  imageUrl: string,
  caption?: string,
): Promise<SendResult> {
  if (platform === "FACEBOOK_PAGE") {
    return sendFacebookPhoto(config as FacebookConfig, imageUrl, caption);
  }
  return sendTelegramPhoto(
    config as TelegramConfig,
    imageUrl,
    caption,
    platform,
  );
}

export async function sendPhotoBufferToPlatform(
  platform: BroadcastPlatformName,
  config: TelegramConfig | FacebookConfig,
  buffer: Buffer,
  caption?: string,
  publicImageUrl?: string,
): Promise<SendResult> {
  if (platform === "FACEBOOK_PAGE") {
    if (!publicImageUrl) {
      throw new Error("Facebook photo post requires a public image URL");
    }
    return sendFacebookPhoto(config as FacebookConfig, publicImageUrl, caption);
  }
  return sendTelegramPhotoBuffer(
    config as TelegramConfig,
    buffer,
    caption,
    platform,
  );
}
