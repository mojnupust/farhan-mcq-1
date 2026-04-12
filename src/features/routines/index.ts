import { apiRoutineService } from "./services/routine.api";
import { mockRoutineService } from "./services/routine.mock";
import type { RoutineService } from "./services/routine.service";

export const routineService: RoutineService =
  process.env.USE_MOCKS === "true" ? mockRoutineService : apiRoutineService;

export type { RoutineService } from "./services/routine.service";
export * from "./types";
