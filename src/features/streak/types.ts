export type DayCellState = "done" | "today" | "locked";

export interface DayCell {
  day: number;
  state: DayCellState;
  amountMinorUnits: number;
}

export interface ActivityGateProgress {
  answeredCount: number;
  minQuestions: number;
  secondsSpent: number;
  minSeconds: number;
}

export interface StreakStatus {
  currentDay: number;
  cap: number;
  isPremium: boolean;
  status: "ACTIVE" | "LOST" | "COMPLETED";
  longestStreak: number;
  completedCycles: number;
  todayDone: boolean;
  nextRewardMinorUnits: number;
  streakLostNotice: boolean;
  badgeLevel: string;
  gate: {
    required: boolean;
    passed: boolean;
    progress: ActivityGateProgress;
  };
  grid: DayCell[];
}

export interface StreakCheckIn {
  id: string;
  dhakaDate: string;
  dayNumber: number;
  rewardMinorUnits: number;
  rewardStatus: "CREDITED" | "QUEUED";
  usedFreeze: boolean;
}

export interface CheckInResult {
  streak: {
    currentDay: number;
    status: string;
    longestStreak: number;
    completedCycles: number;
  };
  checkIn: StreakCheckIn;
  alreadyDone: boolean;
  cycleCompleted: boolean;
}
