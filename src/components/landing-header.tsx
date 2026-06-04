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
  Calendar,
  LayoutDashboard,
  LogInIcon,
  LogOut,
  Route,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/routines", label: "রুটিন", icon: Calendar },
  { href: "/syllabus", label: "সিলেবাস", icon: BookOpen },
  { href: "/job-circular", label: "চাকরির বিজ্ঞপ্তি", icon: Briefcase },
  { href: "/roadmap", label: "ক্যারিয়ার রোডম্যাপ", icon: Route },
];

export function LandingHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
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

          {/* Nav links */}
          <nav className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side */}
        {user ? (
          /* ── Logged-in: avatar + dropdown ── */
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
          /* ── Logged-out: Login button ── */
          <Button size="sm" asChild>
            <Link href="/dashboard">
              <LogInIcon />
              লগইন / রেজিস্ট্রেশন
            </Link>
          </Button>
        )}
      </div>

      {/* Mobile nav */}
      <div className="flex sm:hidden items-center gap-1 px-4 pb-2">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon className="size-3" />
              {label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
