import { apiClient } from "@/lib/api-client";

import type {
  CreatePdfInput,
  PdfComment,
  PdfDocument,
  PdfFilter,
  PdfStats,
} from "../types";
import type { PaginatedPdfs, PdfService } from "./pdf.service";

function buildParams(filter?: PdfFilter): string {
  if (!filter) return "";
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(filter)) {
    if (v !== undefined && v !== null && v !== "") p.set(k, String(v));
  }
  const str = p.toString();
  return str ? `?${str}` : "";
}

function buildFormData(input: Partial<CreatePdfInput>, file?: File): FormData {
  const fd = new FormData();
  if (input.title !== undefined) fd.set("title", input.title);
  if (input.description !== undefined) fd.set("description", input.description);
  if (input.docType !== undefined) fd.set("docType", input.docType);
  if (input.subExamCategoryId)
    fd.set("subExamCategoryId", input.subExamCategoryId);
  if (input.subject !== undefined) fd.set("subject", input.subject);
  if (input.examName !== undefined) fd.set("examName", input.examName);
  if (input.pageCount !== undefined)
    fd.set("pageCount", String(input.pageCount));
  if (input.tags !== undefined) fd.set("tags", input.tags.join(","));
  if (input.isFeatured !== undefined)
    fd.set("isFeatured", String(input.isFeatured));
  if (input.isActive !== undefined) fd.set("isActive", String(input.isActive));
  if (input.isFree !== undefined) fd.set("isFree", String(input.isFree));
  if (file) fd.set("file", file);
  return fd;
}

export const apiPdfService: PdfService = {
  async getAll(filter) {
    return apiClient.get<PaginatedPdfs>(`/v1/pdfs${buildParams(filter)}`);
  },

  async getFeatured() {
    const res = await apiClient.get<{ data: PdfDocument[] }>(
      "/v1/pdfs/featured",
    );
    return res.data;
  },

  async getById(id) {
    const res = await apiClient.get<{ data: PdfDocument }>(`/v1/pdfs/${id}`);
    return res.data;
  },

  async recordView(id) {
    await apiClient.post(`/v1/pdfs/${id}/view`, {});
  },

  // Used by <a>/window.open callers that don't need the auth header (rare) —
  // prefer downloadBlob() + apiClient.getBlob(downloadPath(id)) in components (see B6).
  downloadPath(id) {
    return `/v1/pdfs/${id}/download`;
  },

  async toggleLike(id) {
    const res = await apiClient.post<{
      data: { liked: boolean; likeCount: number };
    }>(`/v1/pdfs/${id}/like`, {});
    return res.data;
  },

  async getComments(id, page = 1, limit = 20) {
    return apiClient.get(`/v1/pdfs/${id}/comments?page=${page}&limit=${limit}`);
  },

  async addComment(id, content) {
    const res = await apiClient.post<{ data: PdfComment }>(
      `/v1/pdfs/${id}/comments`,
      { content },
    );
    return res.data;
  },

  async deleteComment(pdfId, commentId) {
    await apiClient.delete(`/v1/pdfs/${pdfId}/comments/${commentId}`);
  },

  async adminGetAll(filter) {
    return apiClient.get<PaginatedPdfs>(
      `/v1/pdfs/admin/list${buildParams(filter)}`,
    );
  },

  async adminCreate(input, file) {
    const res = await apiClient.postForm<{ data: PdfDocument }>(
      "/v1/pdfs/admin",
      buildFormData(input, file),
    );
    return res.data;
  },

  async adminUpdate(id, input, file) {
    const res = await apiClient.patchForm<{ data: PdfDocument }>(
      `/v1/pdfs/admin/${id}`,
      buildFormData(input, file),
    );
    return res.data;
  },

  async adminDelete(id) {
    await apiClient.delete(`/v1/pdfs/admin/${id}`);
  },

  async adminStats() {
    const res = await apiClient.get<{ data: PdfStats }>("/v1/pdfs/admin/stats");
    return res.data;
  },
};
