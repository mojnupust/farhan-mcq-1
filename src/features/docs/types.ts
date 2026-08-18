export type DocxTemplateStyle = "COLORFUL" | "PLAIN";

export interface DocxStyleConfigInput {
  templateStyle: DocxTemplateStyle;
  columnCount: 1 | 2;
  fontSizePt: number | null;
  fontBn: string;
  brandName: string;
  brandSubtitle: string;
  footerText: string;
  showExplanation: boolean;
  explanationMaxChars: number;
  siteBaseUrl: string;
}

export interface DocxStyleConfig extends DocxStyleConfigInput {
  id: string;
  configHash: string;
  createdBy: string;
  createdAt: string;
}

export interface DocxDocument {
  id: string;
  questionSetIds: string[];
  setsHash: string;
  setCount: number;
  fileUrl: string;
  questionCount: number;
  styleConfigId: string;
  createdAt: string;
  updatedAt: string;
}

export type DocxJobStatus = "QUEUED" | "PROCESSING" | "DONE" | "FAILED";

export interface DocxGenerationJob {
  id: string;
  questionSetIds: string[];
  setsHash: string;
  status: DocxJobStatus;
  progress: number;
  styleConfigId: string;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateDocxResult {
  cached: boolean;
  styleConfigId: string;
  document?: DocxDocument;
  jobId?: string;
}

export interface DocxJobStatusResult extends DocxGenerationJob {
  document?: DocxDocument;
}

export interface DocxExportResult {
  styleConfig: DocxStyleConfig;
  document: DocxDocument;
}
