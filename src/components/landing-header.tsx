"use client";

import { useAuth } from "@/features/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LayoutDashboard, LogInIcon, LogOut } from "lucide-react";
import Link from "next/link";

export function LandingHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-primary">
            Farhan MCQ
          </span>
          <span className="hidden rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary sm:inline">
            সরকারি চাকরি প্রস্তুতি
          </span>
        </Link>

        {/* Right Side */}
        {user ? (
          /* ── Logged-in: avatar + dropdown ── */
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full ring-2 ring-primary/20 hover:ring-primary/50 transition-all focus:outline-none">
                <Avatar className="size-8">
                  <AvatarImage src={user.avatar ?? ""} alt={user.name ?? "User"} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                    {(user.name ?? user.phone ?? "U").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-3 py-2">
                <p className="text-sm font-medium truncate">{user.name ?? "Student"}</p>
                <p className="text-xs text-muted-foreground truncate">{user.phone}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
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
    </header>
  );
}