"use client";

import { DocxGenerator } from "@/features/docs/components/docx-generator";

export default function DocsPage() {
  return <DocxGenerator previewBasePath="/admin/docs/preview" />;
}
