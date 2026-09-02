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
      <CardContent className="space-y-3 p-4 text-sm sm:space-y-4 sm:p-6">
        <div className="flex items-start gap-2">
          <Gift className="mt-0.5 size-5 shrink-0 text-primary" />
          <p className="leading-relaxed">
            <strong>সম্পূর্ণ ফ্রিতে</strong> সকল জব সলুশ্যন Docx ফাইল বানিয়ে
            নিন। আপনার নিজের ব্র্যান্ডের নাম দিন, কালার/টেমপ্লেট ও কলাম
            কাস্টমাইজ করুন — সব ফ্রি। ব্যবসা শুরু করুন।
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-md border border-dashed border-primary/40 bg-background p-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-start gap-2">
            <HandHeart className="mt-0.5 size-5 shrink-0 text-primary" />
            <p className="leading-relaxed">
              যেহেতু এটি ফ্রি, আপনি এটি দ্বারা উপকৃত হলে সাধ্যমতো{" "}
              <strong>৭০ / ৮০ / ৯০ টাকা</strong> নিচের বিকাশ/নগদ নাম্বারে
              পাঠিয়ে দিন 🙏
              <br /> সাইট চালু রাখতে খরচা হয়।
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyNumber}
            className="w-full shrink-0 gap-2 font-mono sm:w-auto"
          >
            {BKASH_NAGAD_NUMBER}
            <Copy className="size-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
