"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { AuthProvider, useAuth } from "@/features/auth";
import { SubscriptionProvider } from "@/features/subscriptions";

function MemberLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-muted-foreground">লোড হচ্ছে...</p>
      </div>
    );
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
