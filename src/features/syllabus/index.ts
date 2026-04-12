import { apiSyllabusService } from "./services/syllabus.api";
import { mockSyllabusService } from "./services/syllabus.mock";
import type { SyllabusService } from "./services/syllabus.service";

export const syllabusService: SyllabusService =
  process.env.USE_MOCKS === "true" ? mockSyllabusService : apiSyllabusService;

export type { SyllabusService } from "./services/syllabus.service";
export * from "./types";
