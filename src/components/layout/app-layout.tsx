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
      {/* min-w-0 (not overflow-x-hidden) prevents horizontal overflow without
          turning main into a scroll container, which would break position:sticky
          for children like the exam page's sticky top bar. */}
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
