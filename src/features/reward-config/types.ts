export interface RewardConfig {
  id: string;
  streakRateMinorUnitsPerDay: number;
  streakFreeDays: number;
  streakPremiumDays: number;
  streakActivityGateFromDay: number;
  streakGateMinQuestions: number;
  streakGateMinSeconds: number;
  streakFreezesFreePerMonth: number;
  streakFreezesPremiumPerMonth: number;
  withdrawalMinMinorUnits: number;
  withdrawalRequiresVerifiedPhone: boolean;
  monthlyBudgetMinorUnits: number;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export type UpdateRewardConfigInput = Partial<
  Omit<RewardConfig, "id" | "updatedBy" | "createdAt" | "updatedAt">
>;
