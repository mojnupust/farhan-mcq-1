import type {
  GenerateSlidesResult,
  JobStatusResult,
  QuestionSetSlidesResult,
  Scene,
  Slide,
  StyleConfigInput,
} from "../types";
import type { SlideService } from "./slide.service";

const mockScene: Scene = {
  width: 1080,
  height: 1080,
  background: { color: "#ffffff", gradient: null },
  nodes: [
    {
      id: "mock-text",
      type: "text",
      x: 56,
      y: 100,
      text: "নমুনা প্রশ্ন — মক ডেটা",
      fontSize: 28,
      fontFamily: "sans-serif",
      fontStyle: "bold",
      align: "left",
      fill: "#0a1a2e",
    },
  ],
};

const mockSlide: Slide = {
  id: "mock-slide-1",
  questionSetId: "mock-question-set",
  order: 1,
  imageUrl: "mock/0001.png",
  sceneJson: mockScene,
  questionIds: ["mock-q-1"],
  styleConfigId: "mock-style-1",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockSlideService: SlideService = {
  async generate(questionSetId: string, styleConfig: StyleConfigInput) {
    const result: GenerateSlidesResult = {
      cached: true,
      styleConfigId: "mock-style-1",
      slides: [{ ...mockSlide, questionSetId }],
    };
    void styleConfig;
    return result;
  },

  async getJobStatus(jobId: string) {
    const result: JobStatusResult = {
      id: jobId,
      questionSetId: "mock-question-set",
      status: "DONE",
      progress: 100,
      styleConfigId: "mock-style-1",
      errorMessage: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slides: [mockSlide],
    };
    return result;
  },

  async getByQuestionSetId() {
    const result: QuestionSetSlidesResult | null = null;
    return result;
  },

  async patchScene() {
    // no-op in mock mode
  },

  async saveAndReRender(slideId: string, sceneJson: unknown) {
    void slideId;
    void sceneJson;
    return { ...mockSlide, updatedAt: new Date().toISOString() };
  },

  async reRender() {
    // no-op in mock mode
  },

  downloadPath() {
    return "/mock/placeholder.png";
  },

  zipPath() {
    return "/mock/placeholder.zip";
  },

  async deleteByQuestionSetId() {
    return { deletedCount: 0 };
  },
};
