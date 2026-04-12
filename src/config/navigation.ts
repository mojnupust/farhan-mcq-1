import { ROUTES } from "@/config/routes";
import {
  Bell,
  BookOpen,
  Calendar,
  ClipboardList,
  CreditCard,
  FileText,
  FolderOpen,
  HelpCircle,
  Home,
  LayoutDashboard,
  Megaphone,
  Package,
  Receipt,
  Settings,
  Star,
  User,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const memberNav: NavItem[] = [
  { label: "হোম", href: ROUTES.dashboard, icon: Home },
  { label: "পরীক্ষা", href: ROUTES.exams, icon: BookOpen },
  { label: "নোটিফিকেশন", href: ROUTES.notifications, icon: Bell },
  { label: "ফেভারিট", href: ROUTES.favorites, icon: Star },
  { label: "রুটিন", href: ROUTES.routine, icon: Calendar },
  { label: "সিলেবাস", href: ROUTES.syllabus, icon: FileText },
  { label: "চাকরির বিজ্ঞপ্তি", href: ROUTES.jobAlerts, icon: Megaphone },
  { label: "ব্লগ পোস্ট", href: ROUTES.blogPosts, icon: ClipboardList },
  { label: "সাবস্ক্রিপশন", href: ROUTES.subscriptions, icon: Receipt },
  { label: "প্রোফাইল", href: ROUTES.profile, icon: User },
];

export const adminNav: NavItem[] = [
  { label: "অ্যাডমিন হোম", href: ROUTES.admin, icon: LayoutDashboard },
  { label: "ক্যাটাগরি", href: ROUTES.adminCategories, icon: FolderOpen },
  { label: "সাব-ক্যাটাগরি", href: ROUTES.adminSubCategories, icon: BookOpen },
  { label: "রুটিন", href: ROUTES.adminRoutines, icon: Calendar },
  { label: "সিলেবাস", href: ROUTES.adminSyllabus, icon: FileText },
  { label: "প্রশ্নসেট", href: ROUTES.adminQuestionSets, icon: ClipboardList },
  { label: "নোটিফিকেশন", href: ROUTES.adminNotifications, icon: Megaphone },
  { label: "প্রশ্ন ব্যাংক", href: ROUTES.adminQuestions, icon: HelpCircle },
  { label: "প্যাকেজ", href: ROUTES.adminPackages, icon: Package },
  { label: "ট্রানজাকশন", href: ROUTES.adminTransactions, icon: CreditCard },
  { label: "সেটিংস", href: ROUTES.adminSettings, icon: Settings },
];
