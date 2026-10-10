export type WithdrawalStatus =
  | "REQUESTED"
  | "APPROVED"
  | "PAID"
  | "REJECTED";

export type PayoutMethod = "BKASH" | "NAGAD" | "ROCKET";

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amountMinorUnits: number;
  method: PayoutMethod;
  destinationNumber: string;
  status: WithdrawalStatus;
  fraudFlag: boolean;
  fraudReason: string | null;
  paidTrxId: string | null;
  adminNote: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string | null;
    mobile: string;
  };
}

export interface WithdrawalEligibility {
  minMinorUnits: number;
  requiresVerifiedPhone: boolean;
  userMobile: string;
  availableMinorUnits: number;
  lockedMinorUnits: number;
  hasPending: boolean;
}

export interface CreateWithdrawalInput {
  amountMinorUnits: number;
  method: PayoutMethod;
  destinationNumber: string;
  idempotencyKey?: string;
}

export interface PaginatedWithdrawals {
  data: WithdrawalRequest[];
  page: number;
  pageSize: number;
  total: number;
}
