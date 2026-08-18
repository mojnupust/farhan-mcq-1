import type {
  DocxExportResult,
  DocxJobStatusResult,
  DocxStyleConfigInput,
  GenerateDocxResult,
} from "../types";

export interface DocxService {
  generate(questionSetIds: string[], styleConfig: DocxStyleConfigInput): Promise<GenerateDocxResult>;
  getJobStatus(jobId: string): Promise<DocxJobStatusResult>;
  getExport(documentId: string): Promise<DocxExportResult | null>;
  downloadPath(documentId: string): string;
  deleteExport(documentId: string): Promise<{ deleted: boolean }>;
}
