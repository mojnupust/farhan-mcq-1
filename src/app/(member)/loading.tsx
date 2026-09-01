import { ContentSkeleton } from "@/components/ui/loading-skeleton";

export default function MemberLoading() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 page-enter">
      <ContentSkeleton />
    </div>
  );
}
