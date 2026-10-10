import type { PayoutMethod, WithdrawalStatus } from "./types";

export const METHOD_BN: Record<PayoutMethod, string> = {
  BKASH: "বিকাশ",
  NAGAD: "নগদ",
  ROCKET: "রকেট",
};

export const STATUS_BN: Record<WithdrawalStatus, string> = {
  REQUESTED: "অনুরোধ করা",
  APPROVED: "অনুমোদিত",
  PAID: "পরিশোধিত",
  REJECTED: "প্রত্যাখ্যাত",
};
