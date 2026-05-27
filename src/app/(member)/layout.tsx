"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { AuthProvider, useAuth } from "@/features/auth";
import { SubscriptionProvider } from "@/features/subscriptions";
import { usePrefetchRoutes } from "@/hooks/use-prefetch-routes";

const MEMBER_ROUTES = [
  "/dashboard",
  "/exams/job-solution",
  "/exams/teacher-recruitment",
  "/exams/bcs-preparation",
  "/profile",
  "/notifications",
];

function MemberLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  // Prefetch common routes after initial load for instant navigation
  usePrefetchRoutes(MEMBER_ROUTES);

  if (isLoading) {
    return <PageLoadingSkeleton />;
  }

  return (
    <AppLayout
      user={{
        name: user?.name || "ব্যবহারকারী",
        email: user?.mobile || "",
        avatar: user?.photo || undefined,
      }}
      isAdmin={false}
    >
      <SubscriptionProvider>{children}</SubscriptionProvider>
    </AppLayout>
  );
}

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <MemberLayoutInner>{children}</MemberLayoutInner>
    </AuthProvider>
  );
}
