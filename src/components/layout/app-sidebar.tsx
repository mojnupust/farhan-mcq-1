"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { adminNav, memberNav, type NavItem } from "@/config/navigation";
import { useAuth } from "@/features/auth";
import { cn } from "@/lib/utils";
import { LogOut, Menu, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface SidebarUser {
  name: string;
  email: string;
  avatar?: string;
}

interface AppSidebarProps {
  isAdmin?: boolean;
  user: SidebarUser;
  unreadNotifications?: number;
}

function NavLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  const pathname = usePathname();
  const isActive =
    item.href === "/dashboard" || item.href === "/admin"
      ? pathname === item.href
      : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-gradient-to-r from-violet-500/10 to-blue-500/10 text-violet-700 border-r-2 border-violet-500 dark:text-violet-300"
          : "text-muted-foreground hover:bg-gradient-to-r hover:from-violet-500/5 hover:to-blue-500/5 hover:text-accent-foreground",
      )}
    >
      <item.icon className="size-4 shrink-0" />
      <span>{item.label}</span>
      {item.badge ? (
        <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-[10px] font-semibold text-white">
          {item.badge > 9 ? "9+" : item.badge}
        </span>
      ) : null}
    </Link>
  );
}

function SidebarContent({
  isAdmin,
  user,
  navItems,
  onNavClick,
  onSignOut,
}: {
  isAdmin?: boolean;
  user: SidebarUser;
  navItems: NavItem[];
  onNavClick?: () => void;
  onSignOut: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-4 py-5">
        <Link
          href="/dashboard"
          className="inline-flex flex-col items-start gap-1 text-xl font-black tracking-tight"
        >
          <span className="inline-flex items-center gap-2">
            <Sparkles className="size-4 text-violet-500" />
            <span className="gradient-text">Farhan MCQ</span>
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            MCQ প্ল্যাটফর্ম
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item, index) => (
          <NavLink key={index} item={item} onClick={onNavClick} />
        ))}

        {isAdmin && (
          <>
            <div className="my-3 h-px bg-gradient-to-r from-violet-500/50 to-blue-500/50" />
            <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Admin
            </p>
            {adminNav.map((item, index) => (
              <NavLink key={index} item={item} onClick={onNavClick} />
            ))}
          </>
        )}
      </nav>

      <div className="border-t p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-all duration-200 hover:bg-accent/60">
              <Avatar size="sm">
                {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                <AvatarFallback>
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <button onClick={onSignOut}>
                <LogOut />
                Sign out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function AppSidebar({
  isAdmin,
  user,
  unreadNotifications,
}: AppSidebarProps) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    logout();
    router.push("/login");
  };

  const navItems = memberNav.map((item) =>
    item.label === "নোটিফিকেশন" && unreadNotifications
      ? { ...item, badge: unreadNotifications }
      : item,
  );

  return (
    <>
      <aside className="hidden w-60 shrink-0 border-r bg-background lg:block">
        <div className="sticky top-0 h-dvh overflow-y-auto">
          <SidebarContent
            isAdmin={isAdmin}
            user={user}
            navItems={navItems}
            onSignOut={handleSignOut}
          />
        </div>
      </aside>

      <div className="glass sticky top-0 z-40 flex h-14 items-center gap-3 border-b px-4 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="size-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-60 p-0" showCloseButton={false}>
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SidebarContent
              isAdmin={isAdmin}
              user={user}
              navItems={navItems}
              onSignOut={handleSignOut}
              onNavClick={() => {
                document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
              }}
            />
          </SheetContent>
        </Sheet>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-base font-black tracking-tight"
        >
          <Sparkles className="size-4 text-violet-500" />
          <span className="gradient-text">Farhan MCQ</span>
        </Link>
      </div>
    </>
  );
}
