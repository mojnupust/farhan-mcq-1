import { INITIAL_PDFS } from "../mock-data";
import type { PdfComment, PdfDocument, PdfFilter } from "./types";

// TEMPORARY in-memory mock backing store, same spirit as the admin page's
// local state. The page components only depend on this module's exported
// `pdfService` shape — once /api/pdfs exists, replace the method bodies
// below with real fetch() calls and nothing else has to change.

let store: PdfDocument[] = INITIAL_PDFS.map((p) => ({ ...p }));

const commentsStore: Record<string, PdfComment[]> = {
  pdf_bcs_50_bangla_previous: [
    {
      id: "cmt_1",
      pdfId: "pdf_bcs_50_bangla_previous",
      userName: "Rakibul Islam",
      content:
        "খুব সুন্দর ব্যাখ্যা, ধন্যবাদ! 'পুঁথি সাহিত্য' অংশটা আগে বুঝিনি।",
      createdAt: "2026-08-02T10:12:00.000Z",
    },
    {
      id: "cmt_2",
      pdfId: "pdf_bcs_50_bangla_previous",
      userName: "সুমাইয়া আক্তার",
      content: "প্রশ্ন ৪ এর ব্যাখ্যাটা আরেকটু বিস্তারিত হলে ভালো হতো।",
      createdAt: "2026-08-03T06:40:00.000Z",
    },
  ],
};

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function sortPdfs(list: PdfDocument[], sort: PdfFilter["sort"]) {
  const sorted = [...list];
  switch (sort) {
    case "most_downloaded":
      sorted.sort((a, b) => b.downloadCount - a.downloadCount);
      break;
    case "most_viewed":
      sorted.sort((a, b) => b.viewCount - a.viewCount);
      break;
    case "popular":
      sorted.sort((a, b) => b.likeCount - a.likeCount);
      break;
    case "newest":
    default:
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }
  return sorted;
}

export const pdfService = {
  async getFeatured(): Promise<PdfDocument[]> {
    return delay(store.filter((p) => p.isFeatured && p.isActive));
  },

  async getAll(filter: PdfFilter = {}) {
    const {
      page = 1,
      limit = 12,
      search,
      docType,
      subExamCategoryId,
      sort = "newest",
      freeOnly,
    } = filter;

    let list = store.filter((p) => p.isActive);

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.subject?.toLowerCase().includes(q) ?? false) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    if (docType) list = list.filter((p) => p.docType === docType);
    if (subExamCategoryId)
      list = list.filter((p) => p.subExamCategoryId === subExamCategoryId);
    if (freeOnly) list = list.filter((p) => p.isFree);

    list = sortPdfs(list, sort);

    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const data = list.slice((page - 1) * limit, page * limit);

    return delay({ data, total, totalPages });
  },

  async getById(id: string): Promise<PdfDocument | null> {
    return delay(store.find((p) => p.id === id) ?? null);
  },

  async recordView(id: string): Promise<void> {
    store = store.map((p) =>
      p.id === id ? { ...p, viewCount: p.viewCount + 1 } : p,
    );
    return delay(undefined, 0);
  },

  async recordDownload(id: string): Promise<void> {
    store = store.map((p) =>
      p.id === id ? { ...p, downloadCount: p.downloadCount + 1 } : p,
    );
    return delay(undefined, 0);
  },

  async toggleLike(id: string): Promise<{ liked: boolean; likeCount: number }> {
    let result = { liked: false, likeCount: 0 };
    store = store.map((p) => {
      if (p.id !== id) return p;
      const liked = !p.likedByMe;
      const likeCount = Math.max(0, p.likeCount + (liked ? 1 : -1));
      result = { liked, likeCount };
      return { ...p, likedByMe: liked, likeCount };
    });
    return delay(result);
  },

  async getComments(id: string): Promise<{ data: PdfComment[] }> {
    return delay({ data: commentsStore[id] ?? [] });
  },

  async addComment(id: string, content: string): Promise<PdfComment> {
    const comment: PdfComment = {
      id: `cmt_${Date.now()}`,
      pdfId: id,
      userName: "আপনি",
      content,
      createdAt: new Date().toISOString(),
    };
    commentsStore[id] = [comment, ...(commentsStore[id] ?? [])];
    store = store.map((p) =>
      p.id === id ? { ...p, commentCount: p.commentCount + 1 } : p,
    );
    return delay(comment);
  },

  async deleteComment(id: string, commentId: string): Promise<void> {
    commentsStore[id] = (commentsStore[id] ?? []).filter(
      (c) => c.id !== commentId,
    );
    store = store.map((p) =>
      p.id === id ? { ...p, commentCount: Math.max(0, p.commentCount - 1) } : p,
    );
    return delay(undefined, 0);
  },
};
