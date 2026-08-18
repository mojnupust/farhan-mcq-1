"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import {
  COLUMN_OPTIONS,
  FONT_OPTIONS,
  TEMPLATE_STYLE_OPTIONS,
} from "../style-presets";
import type { DocxStyleConfigInput } from "../types";

interface DocxStylePanelProps {
  value: DocxStyleConfigInput;
  onChange: (next: DocxStyleConfigInput) => void;
  className?: string;
}

export function DocxStylePanel({ value, onChange, className }: DocxStylePanelProps) {
  function patch(partial: Partial<DocxStyleConfigInput>) {
    onChange({ ...value, ...partial });
  }

  const templateSection = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>টেমপ্লেট স্টাইল</Label>
        <div className="flex flex-wrap gap-2">
          {TEMPLATE_STYLE_OPTIONS.map((opt) => (
            <Button
              key={opt.id}
              type="button"
              size="sm"
              variant={value.templateStyle === opt.id ? "default" : "outline"}
              onClick={() => patch({ templateStyle: opt.id })}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>কলাম সংখ্যা</Label>
        <div className="flex gap-2">
          {COLUMN_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              type="button"
              size="sm"
              variant={value.columnCount === opt.value ? "default" : "outline"}
              onClick={() => patch({ columnCount: opt.value })}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="font-bn">বাংলা ফন্ট</Label>
        <select
          id="font-bn"
          value={value.fontBn}
          onChange={(e) => patch({ fontBn: e.target.value })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="font-size">প্রশ্ন ফন্ট সাইজ (pt)</Label>
          <span className="text-sm text-muted-foreground">
            {value.fontSizePt ?? "ডিফল্ট (১২pt)"}
          </span>
        </div>
        <input
          id="font-size"
          type="range"
          min={8}
          max={18}
          step={1}
          value={value.fontSizePt ?? 12}
          onChange={(e) => patch({ fontSizePt: Number(e.target.value) })}
          className="w-full accent-primary"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto px-0 text-xs"
          onClick={() => patch({ fontSizePt: null })}
        >
          ডিফল্ট সাইজে ফিরুন
        </Button>
      </div>
    </div>
  );

  const brandingSection = (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="brand-name">ব্র্যান্ড নাম</Label>
        <Input
          id="brand-name"
          value={value.brandName}
          onChange={(e) => patch({ brandName: e.target.value })}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="brand-sub">সাবটাইটেল</Label>
        <Input
          id="brand-sub"
          value={value.brandSubtitle}
          onChange={(e) => patch({ brandSubtitle: e.target.value })}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="footer-text">ফুটার টেক্সট</Label>
        <Input
          id="footer-text"
          value={value.footerText}
          onChange={(e) => patch({ footerText: e.target.value })}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="site-url">সাইট URL (ব্যাখ্যা লিংক)</Label>
        <Input
          id="site-url"
          value={value.siteBaseUrl}
          onChange={(e) => patch({ siteBaseUrl: e.target.value })}
        />
      </div>
    </div>
  );

  const togglesSection = (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Label htmlFor="show-explanation">ব্যাখ্যা দেখান</Label>
        <Switch
          id="show-explanation"
          checked={value.showExplanation}
          onCheckedChange={(checked) => patch({ showExplanation: checked })}
        />
      </div>
      {value.showExplanation && (
        <div className="space-y-1">
          <Label htmlFor="explanation-max">ব্যাখ্যা সর্বোচ্চ অক্ষর</Label>
          <Input
            id="explanation-max"
            type="number"
            min={20}
            max={2000}
            value={value.explanationMaxChars}
            onChange={(e) => patch({ explanationMaxChars: Number(e.target.value) })}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className={cn("space-y-4", className)}>
      <div className="hidden space-y-6 md:block">
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">লেআউট ও টেমপ্লেট</h3>
          {templateSection}
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">ব্র্যান্ডিং</h3>
          {brandingSection}
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">ব্যাখ্যা</h3>
          {togglesSection}
        </section>
      </div>

      <Accordion type="multiple" defaultValue={["layout"]} className="md:hidden">
        <AccordionItem value="layout">
          <AccordionTrigger>লেআউট ও টেমপ্লেট</AccordionTrigger>
          <AccordionContent>{templateSection}</AccordionContent>
        </AccordionItem>
        <AccordionItem value="brand">
          <AccordionTrigger>ব্র্যান্ডিং</AccordionTrigger>
          <AccordionContent>{brandingSection}</AccordionContent>
        </AccordionItem>
        <AccordionItem value="toggles">
          <AccordionTrigger>ব্যাখ্যা</AccordionTrigger>
          <AccordionContent>{togglesSection}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
