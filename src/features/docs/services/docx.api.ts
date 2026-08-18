import { apiClient } from "@/lib/api-client";
import type {
  DocxExportResult,
  DocxJobStatusResult,
  DocxStyleConfigInput,
  GenerateDocxResult,
} from "../types";
import type { DocxService } from "./docx.service";

export const apiDocxService: DocxService = {
  async generate(questionSetIds, styleConfig) {
    const res = await apiClient.post<{ data: GenerateDocxResult }>("/v1/docs/generate", {
      questionSetIds,
      styleConfig,
    });
    return res.data;
  },

  async getJobStatus(jobId) {
    const res = await apiClient.get<{ data: DocxJobStatusResult }>(
      `/v1/docs/jobs/${jobId}`,
    );
    return res.data;
  },

  async getExport(documentId) {
    const res = await apiClient.get<{ data: DocxExportResult | null }>(
      `/v1/docs/exports/${documentId}`,
    );
    return res.data;
  },

  downloadPath(documentId) {
    return `/v1/docs/exports/${documentId}/download`;
  },

  async deleteExport(documentId) {
    const res = await apiClient.delete<{ data: { deleted: boolean } }>(
      `/v1/docs/exports/${documentId}`,
    );
    return res.data;
  },
};
