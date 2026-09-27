import { permanentRedirect } from "next/navigation";

import { publicMcqPath } from "@/features/questions/server";

interface Props {
  params: Promise<{ slug: string }>;
}

/** Old catch-all `/{slug}` URLs permanently redirect to `/mcq/{slug}`. */
export default async function LegacyQuestionSlugPage({ params }: Props) {
  const { slug } = await params;
  permanentRedirect(publicMcqPath(slug));
}
