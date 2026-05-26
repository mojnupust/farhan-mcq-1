"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { PageLoader } from "@/components/shared/page-loader";
import { AuthProvider, useAuth } from "@/features/auth";
import { SubscriptionProvider } from "@/features/subscriptions";

function MemberLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
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
