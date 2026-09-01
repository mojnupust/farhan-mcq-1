"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Gift, HandHeart } from "lucide-react";
import { toast } from "sonner";

const BKASH_NAGAD_NUMBER = "01788262433";

export function DocxDonationBanner() {
  function copyNumber() {
    navigator.clipboard
      .writeText(BKASH_NAGAD_NUMBER)
      .then(() => toast.success("নাম্বার কপি হয়েছে"))
      .catch(() => toast.error("কপি করা যায়নি"));
  }

  return (
    <Card className="mb-6 border-primary/30 bg-primary/5">
      <CardContent className="space-y-3 pt-6 text-sm">
        <div className="flex items-start gap-2">
          <Gift className="mt-0.5 size-5 shrink-0 text-primary" />
          <p>
            আপনার জব প্রস্তুতি প্ল্যাটফর্মের জন্য{" "}
            <strong>সম্পূর্ণ ফ্রিতে</strong> প্রশ্নের Docx ফাইল বানিয়ে নিন।
            ব্র্যান্ড নেম রিনেম করে আপনার নিজের ব্র্যান্ডের নাম দিন,
            কালার/টেমপ্লেট ও কলাম কাস্টমাইজ করুন — সব ফ্রি।
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-dashed border-primary/40 bg-background p-3">
          <HandHeart className="size-5 shrink-0 text-primary" />
          <p className="flex-1">
            যেহেতু এটি ফ্রি, আপনি এটি দ্বারা উপকৃত হলে সাধ্যমতো{" "}
            <strong>৭০ / ৮০ / ৯০ টাকা</strong> নিচের বিকাশ/নগদ নাম্বারে পাঠিয়ে
            দিন 🙏
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyNumber}
            className="gap-2 font-mono"
          >
            {BKASH_NAGAD_NUMBER}
            <Copy className="size-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
