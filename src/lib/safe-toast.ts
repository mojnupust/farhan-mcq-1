import { toast } from "sonner";

/** Show a toast after React finishes its current commit (avoids Sonner insertBefore crashes). */
export function toastAfterCommit(
  fn: () => void,
  delayMs = 0,
): void {
  window.setTimeout(fn, delayMs);
}

export function toastSuccessAfterCommit(message: string): void {
  toastAfterCommit(() => toast.success(message));
}

export function toastErrorAfterCommit(message: string): void {
  toastAfterCommit(() => toast.error(message));
}
