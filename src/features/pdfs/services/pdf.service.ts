import type {
  CreatePdfInput,
  PaginatedPdfComments,
  PdfComment,
  PdfDocument,
  PdfFilter,
  PdfStats,
} from "../types";

export interface PaginatedPdfs {
  data: PdfDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PdfService {
  getAll(filter?: PdfFilter): Promise<PaginatedPdfs>;
  getFeatured(): Promise<PdfDocument[]>;
  getById(id: string): Promise<PdfDocument>;
  recordView(id: string): Promise<void>;
  downloadPath(id: string): string;
  toggleLike(id: string): Promise<{ liked: boolean; likeCount: number }>;
  getComments(
    id: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedPdfComments>;
  addComment(id: string, content: string): Promise<PdfComment>;
  deleteComment(pdfId: string, commentId: string): Promise<void>;
  adminGetAll(filter?: PdfFilter): Promise<PaginatedPdfs>;
  adminCreate(
    input: CreatePdfInput,
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<PdfDocument>;
  adminUpdate(
    id: string,
    input: Partial<CreatePdfInput>,
    file?: File,
    onProgress?: (percent: number) => void,
  ): Promise<PdfDocument>;
  adminDelete(id: string): Promise<void>;
  adminStats(): Promise<PdfStats>;
}
