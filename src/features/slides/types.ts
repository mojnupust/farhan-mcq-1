export type SlideMode = "GROUPED" | "SINGLE";

export interface BgGradientStop {
  color: string;
  offset: number;
}

export interface BgGradient {
  type: "linear" | "radial";
  angle?: number;
  stops: BgGradientStop[];
}

export interface StyleConfigInput {
  mode: SlideMode;
  questionsPerSlide: number;
  slideWidth: number;
  slideHeight: number;
  bgColor: string | null;
  bgGradient: BgGradient | null;
  textColor: string;
  textSize: number;
  showOptions: boolean;
  showAnswer: boolean;
  showExplanation: boolean;
}

export interface SlideStyleConfig extends StyleConfigInput {
  id: string;
  configHash: string;
  createdBy: string;
  createdAt: string;
}

export interface SceneNode {
  id: string;
  type: "rect" | "text" | "circle" | "line";
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  cornerRadius?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  dash?: number[];
  points?: number[];
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: "normal" | "bold";
  align?: "left" | "center" | "right";
  lineHeight?: number;
}

export interface Scene {
  width: number;
  height: number;
  background: {
    color?: string | null;
    gradient?: BgGradient | null;
  };
  nodes: SceneNode[];
}

export interface Slide {
  id: string;
  questionSetId: string;
  order: number;
  imageUrl: string;
  sceneJson: Scene;
  questionIds: string[];
  styleConfigId: string;
  createdAt: string;
  updatedAt: string;
}

export type SlideJobStatus = "QUEUED" | "PROCESSING" | "DONE" | "FAILED";

export interface SlideGenerationJob {
  id: string;
  questionSetId: string;
  status: SlideJobStatus;
  progress: number;
  styleConfigId: string;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateSlidesResult {
  cached: boolean;
  styleConfigId: string;
  slides?: Slide[];
  jobId?: string;
}

export interface JobStatusResult extends SlideGenerationJob {
  slides?: Slide[];
}

export interface QuestionSetSlidesResult {
  styleConfig: SlideStyleConfig;
  slides: Slide[];
}
