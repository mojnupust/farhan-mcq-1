import { AppSidebar } from "@/components/layout/app-sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
  isAdmin?: boolean;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  unreadMessages?: number;
}

export function AppLayout({
  children,
  isAdmin,
  user,
  unreadMessages,
}: AppLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <AppSidebar
        isAdmin={isAdmin}
        user={user}
        unreadNotifications={unreadMessages}
      />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
