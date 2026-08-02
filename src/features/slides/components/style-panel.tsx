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
import { Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import {
  GRADIENT_PRESETS,
  SLIDE_SIZE_PRESETS,
  gradientCss,
} from "../style-presets";
import type { BgGradient, SlideMode, StyleConfigInput } from "../types";
import { StylePreviewMock } from "./style-preview-mock";

interface StylePanelProps {
  value: StyleConfigInput;
  onChange: (next: StyleConfigInput) => void;
  className?: string;
}

function gradientMatches(a: BgGradient | null, b: BgGradient): boolean {
  if (!a) return false;
  return JSON.stringify(a) === JSON.stringify(b);
}

export function StylePanel({ value, onChange, className }: StylePanelProps) {
  const [sizePreset, setSizePreset] = useState<string>(() => {
    const match = SLIDE_SIZE_PRESETS.find(
      (p) => p.width === value.slideWidth && p.height === value.slideHeight,
    );
    return match?.id ?? "custom";
  });
  const [bgMode, setBgMode] = useState<"gradient" | "solid">(
    value.bgGradient ? "gradient" : "solid",
  );

  const activeGradientId = useMemo(() => {
    const match = GRADIENT_PRESETS.find((p) => gradientMatches(value.bgGradient, p.gradient));
    return match?.id ?? null;
  }, [value.bgGradient]);

  function patch(partial: Partial<StyleConfigInput>) {
    onChange({ ...value, ...partial });
  }

  function setMode(mode: SlideMode) {
    patch({
      mode,
      questionsPerSlide: mode === "SINGLE" ? 1 : Math.max(value.questionsPerSlide, 1),
    });
  }

  function selectGradient(presetId: string) {
    const preset = GRADIENT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setBgMode("gradient");
    const isDark = presetId === "navy-gold";
    patch({
      bgGradient: preset.gradient,
      bgColor: null,
      textColor: isDark ? "#f8fafc" : value.textColor === "#f8fafc" ? "#0a1a2e" : value.textColor,
    });
  }

  function selectSizePreset(presetId: string) {
    setSizePreset(presetId);
    if (presetId === "custom") return;
    const preset = SLIDE_SIZE_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      patch({ slideWidth: preset.width, slideHeight: preset.height });
    }
  }

  const backgroundSection = (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant={bgMode === "gradient" ? "default" : "outline"}
          onClick={() => {
            setBgMode("gradient");
            if (!value.bgGradient) selectGradient(GRADIENT_PRESETS[0]!.id);
          }}
        >
          গ্রেডিয়েন্ট
        </Button>
        <Button
          type="button"
          size="sm"
          variant={bgMode === "solid" ? "default" : "outline"}
          onClick={() => {
            setBgMode("solid");
            patch({
              bgGradient: null,
              bgColor: value.bgColor ?? "#ffffff",
            });
          }}
        >
          এক রঙ
        </Button>
      </div>

      {bgMode === "gradient" ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {GRADIENT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => selectGradient(preset.id)}
              className={cn(
                "rounded-lg border-2 p-2 text-left transition-all",
                activeGradientId === preset.id
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-transparent hover:border-muted-foreground/30",
              )}
            >
              <div
                className="mb-1.5 h-10 w-full rounded-md"
                style={{ background: gradientCss(preset.gradient) }}
              />
              <span className="text-xs font-medium">{preset.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Label htmlFor="bg-solid" className="shrink-0">
            ব্যাকগ্রাউন্ড
          </Label>
          <input
            id="bg-solid"
            type="color"
            value={value.bgColor ?? "#ffffff"}
            onChange={(e) => patch({ bgColor: e.target.value, bgGradient: null })}
            className="h-10 w-14 cursor-pointer rounded border bg-transparent"
          />
          <Input
            value={value.bgColor ?? "#ffffff"}
            onChange={(e) => patch({ bgColor: e.target.value, bgGradient: null })}
            className="font-mono text-sm"
          />
        </div>
      )}
    </div>
  );

  const textSection = (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Label htmlFor="text-color" className="shrink-0">
          টেক্সট রঙ
        </Label>
        <input
          id="text-color"
          type="color"
          value={value.textColor}
          onChange={(e) => patch({ textColor: e.target.value })}
          className="h-10 w-14 cursor-pointer rounded border bg-transparent"
        />
        <Input
          value={value.textColor}
          onChange={(e) => patch({ textColor: e.target.value })}
          className="font-mono text-sm"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="text-size">টেক্সট সাইজ</Label>
          <span className="text-sm text-muted-foreground">{value.textSize}px</span>
        </div>
        <input
          id="text-size"
          type="range"
          min={14}
          max={48}
          step={1}
          value={value.textSize}
          onChange={(e) => patch({ textSize: Number(e.target.value) })}
          className="w-full accent-primary"
        />
      </div>
      <StylePreviewMock style={value} />
    </div>
  );

  const layoutSection = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>স্লাইড সাইজ</Label>
        <div className="flex flex-wrap gap-2">
          {SLIDE_SIZE_PRESETS.map((preset) => (
            <Button
              key={preset.id}
              type="button"
              size="sm"
              variant={sizePreset === preset.id ? "default" : "outline"}
              onClick={() => selectSizePreset(preset.id)}
            >
              {preset.label}
            </Button>
          ))}
          <Button
            type="button"
            size="sm"
            variant={sizePreset === "custom" ? "default" : "outline"}
            onClick={() => setSizePreset("custom")}
          >
            কাস্টম
          </Button>
        </div>
        {sizePreset === "custom" && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="slide-w">প্রস্থ (px)</Label>
              <Input
                id="slide-w"
                type="number"
                min={200}
                max={4000}
                value={value.slideWidth}
                onChange={(e) => patch({ slideWidth: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="slide-h">উচ্চতা (px)</Label>
              <Input
                id="slide-h"
                type="number"
                min={200}
                max={4000}
                value={value.slideHeight}
                onChange={(e) => patch({ slideHeight: Number(e.target.value) })}
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>মোড</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={value.mode === "GROUPED" ? "default" : "outline"}
            onClick={() => setMode("GROUPED")}
            className="flex-1"
          >
            গ্রুপ (এক স্লাইডে কয়েকটি)
          </Button>
          <Button
            type="button"
            size="sm"
            variant={value.mode === "SINGLE" ? "default" : "outline"}
            onClick={() => setMode("SINGLE")}
            className="flex-1"
          >
            প্রতি স্লাইডে ১ প্রশ্ন
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>প্রতি স্লাইডে প্রশ্ন</Label>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            size="icon"
            variant="outline"
            disabled={value.mode === "SINGLE" || value.questionsPerSlide <= 1}
            onClick={() =>
              patch({ questionsPerSlide: Math.max(1, value.questionsPerSlide - 1) })
            }
          >
            <Minus className="size-4" />
          </Button>
          <span className="min-w-[2ch] text-center text-lg font-semibold">
            {value.mode === "SINGLE" ? 1 : value.questionsPerSlide}
          </span>
          <Button
            type="button"
            size="icon"
            variant="outline"
            disabled={value.mode === "SINGLE" || value.questionsPerSlide >= 10}
            onClick={() =>
              patch({ questionsPerSlide: Math.min(10, value.questionsPerSlide + 1) })
            }
          >
            <Plus className="size-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          স্লাইডের উচ্চতা স্বয়ংক্রিয়ভাবে বাড়বে
        </p>
      </div>
    </div>
  );

  const togglesSection = (
    <div className="space-y-4">
      {[
        { key: "showOptions" as const, label: "অপশন দেখান" },
        { key: "showAnswer" as const, label: "সঠিক উত্তর হাইলাইট" },
        { key: "showExplanation" as const, label: "ব্যাখ্যা দেখান" },
      ].map(({ key, label }) => (
        <div key={key} className="flex items-center justify-between gap-4">
          <Label htmlFor={key}>{label}</Label>
          <Switch
            id={key}
            checked={value[key]}
            onCheckedChange={(checked) => patch({ [key]: checked })}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Desktop: open sections */}
      <div className="hidden space-y-6 md:block">
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">ব্যাকগ্রাউন্ড</h3>
          {backgroundSection}
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">টেক্সট</h3>
          {textSection}
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">লেআউট</h3>
          {layoutSection}
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">অপশন</h3>
          {togglesSection}
        </section>
      </div>

      {/* Mobile: accordion */}
      <Accordion type="multiple" defaultValue={["bg", "text"]} className="md:hidden">
        <AccordionItem value="bg">
          <AccordionTrigger>ব্যাকগ্রাউন্ড</AccordionTrigger>
          <AccordionContent>{backgroundSection}</AccordionContent>
        </AccordionItem>
        <AccordionItem value="text">
          <AccordionTrigger>টেক্সট ও প্রিভিউ</AccordionTrigger>
          <AccordionContent>{textSection}</AccordionContent>
        </AccordionItem>
        <AccordionItem value="layout">
          <AccordionTrigger>লেআউট</AccordionTrigger>
          <AccordionContent>{layoutSection}</AccordionContent>
        </AccordionItem>
        <AccordionItem value="toggles">
          <AccordionTrigger>অপশন</AccordionTrigger>
          <AccordionContent>{togglesSection}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
