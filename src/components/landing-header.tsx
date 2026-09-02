"use client";

import { BrandLogo } from "@/components/brand-logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth";
import {
  BookOpen,
  Briefcase,
  FileEdit,
  Folder,
  LayoutDashboard,
  LogInIcon,
  LogOut,
  Play,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/pdf-library", label: "PDF", icon: Folder },
  { href: "/syllabus", label: "Syllabus", icon: BookOpen },
  { href: "/docs", label: "Docx", icon: FileEdit, isNew: true },
  { href: "/job-circular", label: "Job", icon: Briefcase },
  { href: "/videos", label: "Video", icon: Play },
];

export function LandingHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <div className="flex items-center gap-4 lg:gap-6">
            <Link href="/" className="shrink-0">
              <BrandLogo
                iconClassName="size-9"
                titleClassName="text-base text-primary sm:text-lg"
              />
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden sm:flex items-center gap-1">
              {NAV_LINKS.map(({ href, label, icon: Icon, isNew }) => {
                const active =
                  pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-3.5" />
                    {label}
                    {isNew && (
                      <span className="absolute -top-0.5 -right-0.5 flex size-2">
                        <span className="badge-ping absolute inline-flex h-full w-full rounded-full bg-red-500" />
                        <span className="relative inline-flex size-2 rounded-full bg-red-500" />
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Side */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full ring-2 ring-primary/20 hover:ring-primary/50 transition-all focus:outline-none">
                  <Avatar className="size-8">
                    <AvatarImage
                      src={user?.photo ?? ""}
                      alt={user.name ?? "User"}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                      {(user.name ?? user.mobile ?? "U")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium truncate">
                    {user.name ?? "Student"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.mobile}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <LayoutDashboard className="size-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="flex items-center gap-2 text-destructive cursor-pointer"
                >
                  <LogOut className="size-4" />
                  লগআউট
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" asChild>
              <Link href="/login">
                <LogInIcon />
                লগইন / রেজিস্ট্রেশন
              </Link>
            </Button>
          )}
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-50 flex sm:hidden items-stretch border-t bg-background/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]"
      >
        {NAV_LINKS.map(({ href, label, icon: Icon, isNew }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium"
            >
              {active && (
                <span className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-primary" />
              )}
              <span className="relative">
                <Icon
                  className={`size-5 ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                {isNew && (
                  <span className="absolute -top-0.5 -right-0.5 flex size-1.5">
                    <span className="badge-ping absolute inline-flex h-full w-full rounded-full bg-red-500" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-red-500" />
                  </span>
                )}
              </span>
              <span
                className={active ? "text-primary" : "text-muted-foreground"}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
