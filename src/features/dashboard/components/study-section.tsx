import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Calendar, ClipboardList, Star } from "lucide-react";
import Link from "next/link";

const studyItems = [
  {
    title: "বিষয়ভিত্তিক প্র্যাক্টিস",
    description: "বিষয় বেছে নিয়ে প্র্যাক্টিস করুন",
    icon: BookOpen,
    href: "/exam-subject-topic",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "group-hover:border-emerald-200 dark:group-hover:border-emerald-800",
  },
  {
    title: "মডেল টেস্ট",
    description: "পূর্ণাঙ্গ মডেল টেস্ট দিন",
    icon: ClipboardList,
    href: "#",
    color: "text-violet-600",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
    borderColor: "group-hover:border-violet-200 dark:group-hover:border-violet-800",
  },
  {
    title: "পরীক্ষার রুটিন",
    description: "আসন্ন পরীক্ষার তারিখ দেখুন",
    icon: Calendar,
    href: "/routines",
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "group-hover:border-amber-200 dark:group-hover:border-amber-800",
  },
  {
    title: "ফেভারিট প্রশ্ন",
    description: "সংরক্ষিত প্রশ্ন পড়ুন",
    icon: Star,
    href: "/favorites",
    color: "text-rose-600",
    bgColor: "bg-rose-50 dark:bg-rose-950/30",
    borderColor: "group-hover:border-rose-200 dark:group-hover:border-rose-800",
  },
];

export function StudySection() {
  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {studyItems.map((item) => (
        <Link key={item.title} href={item.href}>
          <Card className={`group card-hover-lift cursor-pointer h-full transition-all duration-300 ${item.borderColor}`}>
            <CardHeader className="p-4">
              <div className={`inline-flex size-10 items-center justify-center rounded-xl ${item.bgColor} transition-transform duration-300 group-hover:scale-105`}>
                <item.icon className={`size-5 ${item.color}`} />
              </div>
              <CardTitle className="text-sm font-medium mt-2">
                {item.title}
              </CardTitle>
              <CardDescription className="text-xs">
                {item.description}
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}
