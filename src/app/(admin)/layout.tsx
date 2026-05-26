"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { PageLoader } from "@/components/shared/page-loader";
import { AuthProvider, useAuth } from "@/features/auth";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <AppLayout
      user={{
        name: user?.name || "অ্যাডমিন",
        email: user?.mobile || "",
        avatar: user?.photo || undefined,
      }}
      isAdmin={true}
    >
      {children}
    </AppLayout>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AuthProvider>
  );
}
