"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { useAuth } from "@/features/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
