"use client";

import { ROUTES } from "@/config/routes";
import { DocxPreview } from "@/features/docs/components/docx-preview";
import { use } from "react";

export default function PublicDocsPreviewPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = use(params);
  return (
    <DocxPreview
      documentId={documentId}
      backRoute={ROUTES.docs}
      newStyleRoute={ROUTES.docs}
      showDelete={false}
      showDonationBanner
      maxWidthClassName="max-w-5xl"
    />
  );
}
