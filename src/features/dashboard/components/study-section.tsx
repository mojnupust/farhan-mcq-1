import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Star } from "lucide-react";
import Link from "next/link";

const studyItems = [
  // {
  //   title: "বিষয়ভিত্তিক প্র্যাক্টিস",
  //   description: "বিষয় বেছে নিয়ে প্র্যাক্টিস করুন",
  //   icon: BookOpen,
  //   href: "/exam-subject-topic",
  //   color: "text-emerald-600",
  //   bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
  //   borderColor:
  //     "group-hover:border-emerald-200 dark:group-hover:border-emerald-800",
  // },

  {
    title: "পরীক্ষার রুটিন",
    description: "আসন্ন পরীক্ষার তারিখ দেখুন",
    icon: Calendar,
    href: "/routines",
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor:
      "group-hover:border-amber-200 dark:group-hover:border-amber-800",
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
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {studyItems.map((item) => (
        <Link key={item.title} href={item.href} className="block">
          <Card
            className={`group h-full cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${item.borderColor}`}
          >
            <CardHeader className="flex flex-col items-center justify-center p-5 text-center">
              {/* Icon */}
              <div
                className={`flex size-12 items-center justify-center rounded-2xl ${item.bgColor} transition-transform duration-300 group-hover:scale-110`}
              >
                <item.icon className={`size-6 ${item.color}`} />
              </div>

              {/* Title */}
              <CardTitle className="mt-3 text-sm font-semibold">
                {item.title}
              </CardTitle>

              {/* Description */}
              <CardDescription className="mt-1 text-xs leading-relaxed">
                {item.description}
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}
