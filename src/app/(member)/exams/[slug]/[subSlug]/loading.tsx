import { ContentSkeleton } from "@/components/ui/loading-skeleton";

export default function SubExamLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <ContentSkeleton />
    </div>
  );
}
