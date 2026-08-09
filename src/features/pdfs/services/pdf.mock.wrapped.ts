import { pdfService as legacyMock } from "./pdf.mock";
import type { PdfService } from "./pdf.service";

// pdf.mock.ts আগের UI বিল্ড করার জন্য বানানো mock — সেটার শেপ নতুন PdfService
// ইন্টারফেসের সাথে ঠিক মেলে না (fileUrl vs fileName, File আপলোড ইত্যাদি)।
// dev/preview-এ USE_MOCKS=true থাকলে এটা কাজ চালিয়ে নেয়, প্রোডাকশনে ব্যবহার হয় না।
export const mockPdfService: PdfService = {
  ...legacyMock,
  downloadPath: (id: string) => `/mock/pdfs/${id}/download`,
  adminCreate: async (input) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return legacyMock.getById(input.title) as any; // placeholder — mock পাথে ফাইল লাগে না
  },
  adminUpdate: async (id, input) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return legacyMock.getById(id) as any;
  },
} as unknown as PdfService;
