"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const DOCX_FAQ_ITEMS = [
  {
    question: "Docx ফাইল তৈরি করা কি সত্যিই ফ্রি?",
    answer:
      "হ্যাঁ, সম্পূর্ণ ফ্রি। কোনো লুকানো চার্জ বা সাবস্ক্রিপশন লাগবে না।",
  },
  {
    question: "আমি কি নিজের ব্র্যান্ড নাম যোগ করতে পারব?",
    answer:
      "হ্যাঁ। লেআউট ও ডিজাইন ধাপে নিজের ব্র্যান্ড নাম, সাবটাইটেল ও ফুটার টেক্সট বসিয়ে নিতে পারবেন।",
  },
  {
    question: "তৈরি করা Docx ফাইল কি আমি প্রিন্ট করে বিক্রি করতে পারব?",
    answer:
      "হ্যাঁ, ফাইলটি সম্পূর্ণ আপনার। প্রিন্ট করে কোচিং সেন্টার বা শিক্ষার্থীদের কাছে বিতরণ বা বিক্রি করতে পারবেন।",
  },
  {
    question: "একসাথে কতগুলো প্রশ্নসেট যোগ করা যাবে?",
    answer:
      "একই সাব-ক্যাটাগরি থেকে একাধিক প্রশ্নসেট একসাথে নির্বাচন করে একটি Docx ফাইলে যোগ করতে পারবেন।",
  },
  {
    question: "ফাইলটি তৈরি হতে কতক্ষণ সময় লাগে?",
    answer:
      "সাধারণত কয়েক সেকেন্ড থেকে এক মিনিটের মধ্যে ফাইল তৈরি হয়ে যায়, প্রশ্নসংখ্যার উপর নির্ভর করে।",
  },
  {
    question: "প্রশ্নের ব্যাখ্যা কি Docx ফাইলে রাখা যাবে?",
    answer:
      "হ্যাঁ, লেআউট ও ডিজাইন ধাপে \"ব্যাখ্যা দেখান\" অপশন চালু করলে প্রতিটি প্রশ্নের নিচে ব্যাখ্যা যুক্ত হবে।",
  },
] as const;

export function DocxFaq() {
  return (
    <Accordion type="multiple" defaultValue={["item-0"]} className="w-full">
      {DOCX_FAQ_ITEMS.map((item, idx) => (
        <AccordionItem key={item.question} value={`item-${idx}`}>
          <AccordionTrigger className="text-left text-sm font-medium sm:text-base">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
