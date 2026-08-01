import { apiClient } from "@/lib/api-client";
import type {
  GenerateSlidesResult,
  JobStatusResult,
  QuestionSetSlidesResult,
  StyleConfigInput,
} from "../types";
import type { SlideService } from "./slide.service";

export const apiSlideService: SlideService = {
  async generate(questionSetId: string, styleConfig: StyleConfigInput) {
    const res = await apiClient.post<{ data: GenerateSlidesResult }>(
      "/v1/slides/generate",
      { questionSetId, styleConfig },
    );
    return res.data;
  },

  async getJobStatus(jobId: string) {
    const res = await apiClient.get<{ data: JobStatusResult }>(
      `/v1/slides/jobs/${jobId}`,
    );
    return res.data;
  },

  async getByQuestionSetId(questionSetId: string) {
    const res = await apiClient.get<{ data: QuestionSetSlidesResult | null }>(
      `/v1/slides/${questionSetId}`,
    );
    return res.data;
  },

  async patchScene(slideId: string, sceneJson: unknown) {
    await apiClient.patch(`/v1/slides/${slideId}`, { sceneJson });
  },

  async reRender(slideId: string) {
    await apiClient.post(`/v1/slides/${slideId}/render`, {});
  },

  downloadPath(slideId: string) {
    return `/v1/slides/${slideId}/download`;
  },

  zipPath(questionSetId: string, styleConfigId?: string) {
    const query = styleConfigId ? `?styleConfigId=${styleConfigId}` : "";
    return `/v1/slides/${questionSetId}/zip${query}`;
  },
};
