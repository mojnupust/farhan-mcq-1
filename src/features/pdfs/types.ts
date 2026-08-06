// PDF library feature types.
// Mirrors features/videos/types.ts so both admin pages share the same shape
// and can eventually share list/pagination helpers.

export type PdfDocType =
  | "SYLLABUS"
  | "ROUTINE"
  | "QUESTION_BANK"
  | "PREVIOUS_QUESTIONS"
  | "BOOK_GUIDE"
  | "NOTES"
  | "MODEL_TEST"
  | "OTHER";

// A lightweight reference to sub_exam_categories (see sub_exam_categories table)
// so a PDF can optionally be tied to the same exam track used by
// question_sets, routines and syllabuses.
export interface SubExamCategoryOption {
  id: string;
  name: string;
}

export interface PdfDocument {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  docType: PdfDocType;
  subExamCategoryId?: string | null;
  subject?: string;
  examName?: string;
  tags: string[];
  fileSizeKb?: number;
  pageCount?: number;
  downloadCount: number;
  viewCount: number;
  likeCount: number;
  likedByMe?: boolean;
  commentCount: number;
  isFeatured: boolean;
  isActive: boolean;
  isFree: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreatePdfInput = Omit<
  PdfDocument,
  | "id"
  | "downloadCount"
  | "viewCount"
  | "likeCount"
  | "likedByMe"
  | "commentCount"
  | "createdAt"
  | "updatedAt"
>;

export type PdfSort = "newest" | "popular" | "most_downloaded" | "most_viewed";

export interface PdfFilter {
  page?: number;
  limit?: number;
  search?: string;
  docType?: PdfDocType;
  subExamCategoryId?: string;
  sort?: PdfSort;
  freeOnly?: boolean;
}

export interface PdfComment {
  id: string;
  pdfId: string;
  userId?: string;
  userName?: string;
  content: string;
  createdAt: string;
}
