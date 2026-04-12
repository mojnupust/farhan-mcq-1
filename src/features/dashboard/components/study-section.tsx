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
    href: "#",
    color: "text-emerald-600",
  },
  {
    title: "মডেল টেস্ট",
    description: "পূর্ণাঙ্গ মডেল টেস্ট দিন",
    icon: ClipboardList,
    href: "#",
    color: "text-violet-600",
  },
  {
    title: "পরীক্ষার রুটিন",
    description: "আসন্ন পরীক্ষার তারিখ দেখুন",
    icon: Calendar,
    href: "#",
    color: "text-amber-600",
  },
  {
    title: "ফেভারিট প্রশ্ন",
    description: "সংরক্ষিত প্রশ্ন পড়ুন",
    icon: Star,
    href: "#",
    color: "text-rose-600",
  },
];

export function StudySection() {
  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {studyItems.map((item) => (
        <Link key={item.title} href={item.href}>
          <Card className="group transition-all hover:shadow-md cursor-pointer h-full">
            <CardHeader className="p-4">
              <item.icon className={`size-6 ${item.color} mb-1`} />
              <CardTitle className="text-sm font-medium">
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
