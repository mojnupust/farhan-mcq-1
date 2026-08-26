"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageCircle } from "lucide-react";

export const SUPPORT_MOBILE = "01788262433";
export const SUPPORT_WHATSAPP_HREF = `https://wa.me/8801788262433?text=${encodeURIComponent(
  "আসসালামু আলাইকুম, আমি নতুন অ্যাকাউন্ট নিতে চাই।\nনাম: \nমোবাইল: ",
)}`;

const LOGIN_MESSAGE =
  "নতুন আইডি নিতে নাম ও মোবাইল নম্বর দিয়ে WhatsApp-এ যোগাযোগ করুন।";
const REGISTER_MESSAGE =
  "অনলাইন রেজিস্ট্রেশন খোলা নেই; নাম ও মোবাইল লিখে মেসেজ করুন।";

function WhatsAppActions() {
  return (
    <div className="flex flex-col gap-2">
      <a
        href={SUPPORT_WHATSAPP_HREF}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-foreground tabular-nums hover:underline"
      >
        {SUPPORT_MOBILE}
      </a>
      <Button asChild className="w-full">
        <a
          href={SUPPORT_WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle className="size-4" />
          WhatsApp-এ মেসেজ করুন
        </a>
      </Button>
    </div>
  );
}

type RegistrationClosedNoticeProps = {
  compact?: boolean;
};

export function RegistrationClosedNotice({
  compact = false,
}: RegistrationClosedNoticeProps) {
  return (
    <Alert className="border-primary/20 bg-primary/5">
      <MessageCircle className="size-4 text-primary" />
      <AlertTitle>নতুন রেজিস্ট্রেশন বন্ধ আছে</AlertTitle>
      <AlertDescription className="mt-2 space-y-3 text-muted-foreground">
        <p>{compact ? LOGIN_MESSAGE : REGISTER_MESSAGE}</p>
        <WhatsAppActions />
      </AlertDescription>
    </Alert>
  );
}

type RegistrationClosedDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RegistrationClosedDialog({
  open,
  onOpenChange,
}: RegistrationClosedDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90dvh,100%)] w-full max-w-sm overflow-y-auto pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <DialogHeader className="text-left">
          <DialogTitle>নতুন রেজিস্ট্রেশন বন্ধ আছে</DialogTitle>
          <DialogDescription>{LOGIN_MESSAGE}</DialogDescription>
        </DialogHeader>
        <WhatsAppActions />
      </DialogContent>
    </Dialog>
  );
}
