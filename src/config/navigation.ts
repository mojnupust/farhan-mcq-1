import { ROUTES } from "@/config/routes";
import {
  Bell,
  BookOpen,
  Briefcase,
  Calendar,
  ClipboardList,
  CreditCard,
  FileText,
  FileTextIcon,
  FolderOpen,
  Home,
  LayoutDashboard,
  LucideFileText,
  Megaphone,
  Package,
  Radio,
  Receipt,
  Settings,
  Star,
  User,
  Video,
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

  { label: "ভিডিও লাইব্রেরি", href: ROUTES.videos, icon: Video },
  { label: "পিডিএফ লাইব্রেরি", href: ROUTES.pdf, icon: LucideFileText },
  { label: "নোটিফিকেশন", href: ROUTES.notifications, icon: Bell },
  { label: "ফেভারিট", href: ROUTES.favorites, icon: Star },
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
  {
    label: "প্রশ্নসেট অটোমোশন",
    href: ROUTES.adminQuestionSetsAutomotion,
    icon: ClipboardList,
  },
  { label: "চাকরির বিজ্ঞপ্তি", href: ROUTES.adminJobCircular, icon: Briefcase },
  { label: "ভিডিও ব্যবস্থপনা", href: ROUTES.adminVideos, icon: Video },
  {
    label: "পিডিএফ ব্যবস্থপনা",
    href: ROUTES.adminPdfManagement,
    icon: FileTextIcon,
  },
  { label: "Docx এক্সপোর্ট", href: ROUTES.adminDocs, icon: FileTextIcon },
  { label: "নোটিফিকেশন", href: ROUTES.adminNotifications, icon: Megaphone },
  {
    label: "ব্রডকাস্ট সেন্টার",
    href: ROUTES.adminBroadcastCenter,
    icon: Radio,
  },

  { label: "প্যাকেজ", href: ROUTES.adminPackages, icon: Package },
  { label: "ট্রানজাকশন", href: ROUTES.adminTransactions, icon: CreditCard },
  { label: "সেটিংস", href: ROUTES.adminSettings, icon: Settings },
];
