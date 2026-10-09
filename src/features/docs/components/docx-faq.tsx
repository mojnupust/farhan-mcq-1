"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { DOCX_FAQ_ITEMS } from "./docx-faq-items";

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
