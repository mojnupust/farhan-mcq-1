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
    <div className="ui-shell flex min-h-dvh flex-col lg:flex-row">
      <AppSidebar
        isAdmin={isAdmin}
        user={user}
        unreadNotifications={unreadMessages}
      />
      <main className="ui-content flex-1 overflow-x-hidden bg-gradient-to-br from-background/40 via-background/70 to-muted/30">
        {children}
      </main>
    </div>
  );
}
