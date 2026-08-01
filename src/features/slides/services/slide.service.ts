import type {
  GenerateSlidesResult,
  JobStatusResult,
  QuestionSetSlidesResult,
  StyleConfigInput,
} from "../types";

export interface SlideService {
  generate(
    questionSetId: string,
    styleConfig: StyleConfigInput,
  ): Promise<GenerateSlidesResult>;
  getJobStatus(jobId: string): Promise<JobStatusResult>;
  getByQuestionSetId(
    questionSetId: string,
  ): Promise<QuestionSetSlidesResult | null>;
  patchScene(slideId: string, sceneJson: unknown): Promise<void>;
  reRender(slideId: string): Promise<void>;
  downloadPath(slideId: string): string;
  zipPath(questionSetId: string, styleConfigId?: string): string;
}
