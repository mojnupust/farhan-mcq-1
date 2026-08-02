import { downloadBlob } from "@/lib/download-blob";

/** Share a PNG blob via native share sheet, or fall back to download. */
export async function shareOrDownloadImage(
  blob: Blob,
  filename: string,
  title: string,
): Promise<"shared" | "downloaded"> {
  const file = new File([blob], filename, { type: "image/png" });

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      const payload: ShareData = { title, files: [file] };
      if (navigator.canShare?.(payload)) {
        await navigator.share(payload);
        return "shared";
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        throw err;
      }
    }
  }

  downloadBlob(blob, filename);
  return "downloaded";
}
