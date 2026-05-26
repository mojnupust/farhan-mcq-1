import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-violet-900 via-blue-900 to-slate-900 px-4 text-center">
      <div className="absolute -left-8 top-20 size-72 rounded-full bg-purple-500/20 blur-3xl animate-float" />
      <div className="absolute right-0 top-0 size-80 rounded-full bg-blue-500/15 blur-3xl animate-float [animation-delay:500ms]" />
      <div className="relative space-y-4">
        <p className="text-7xl font-black tracking-tight gradient-text sm:text-8xl">৪০৪</p>
        <p className="text-lg font-semibold text-white">পেজটি খুঁজে পাওয়া যায়নি</p>
        <p className="text-sm text-violet-100/80">
          আপনি যে পেজটি খুঁজছেন সেটি এখানে নেই।
        </p>
        <div className="text-6xl animate-float">🧭</div>
        <Button className="rounded-full bg-gradient-to-r from-violet-600 to-blue-500" asChild>
          <Link href="/">হোমে ফিরুন</Link>
        </Button>
      </div>
    </div>
  );
}
