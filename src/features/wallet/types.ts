export interface WalletAccount {
  id: string;
  userId: string;
  balanceMinorUnits: number;
  lockedMinorUnits: number;
  availableMinorUnits: number;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface WalletLedgerEntry {
  id: string;
  type: string;
  direction: "CREDIT" | "DEBIT";
  amountMinorUnits: number;
  balanceAfterMinorUnits: number;
  referenceType: string;
  note: string | null;
  createdAt: string;
}
