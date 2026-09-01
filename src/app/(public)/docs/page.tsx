import { DocxGenerator } from "@/features/docs/components/docx-generator";

export default function PublicDocsPage() {
  return (
    <DocxGenerator
      previewBasePath="/docs/preview"
      showDonationBanner
      maxWidthClassName="max-w-5xl"
    />
  );
}
