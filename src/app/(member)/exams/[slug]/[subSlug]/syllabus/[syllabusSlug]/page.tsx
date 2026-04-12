"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Syllabus } from "@/features/syllabus";
import { syllabusService } from "@/features/syllabus";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";

/**
 * Renders markdown/MDX content as HTML.
 * Supports: headings, bold, italic, lists (ordered/unordered),
 * links, images, YouTube embeds, and plain text.
 */
function renderContent(content: string): string {
  let html = content;

  // YouTube embeds: ![youtube](URL) or {{youtube:URL}}
  html = html.replace(
    /!\[youtube\]\((https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)[^)]*)\)/gi,
    (_match, _url, id) =>
      `<div class="my-4 aspect-video"><iframe src="https://www.youtube.com/embed/${id}" class="w-full h-full rounded-lg" frameborder="0" allowfullscreen></iframe></div>`,
  );
  html = html.replace(
    /\{\{youtube:(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)[^}]*)\}\}/gi,
    (_match, _url, id) =>
      `<div class="my-4 aspect-video"><iframe src="https://www.youtube.com/embed/${id}" class="w-full h-full rounded-lg" frameborder="0" allowfullscreen></iframe></div>`,
  );

  // Images
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" class="my-4 max-w-full rounded-lg" />',
  );

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary/80">$1</a>',
  );

  // Headings
  html = html.replace(
    /^### (.+)$/gm,
    '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>',
  );
  html = html.replace(
    /^## (.+)$/gm,
    '<h2 class="text-xl font-semibold mt-8 mb-3">$1</h2>',
  );
  html = html.replace(
    /^# (.+)$/gm,
    '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>',
  );

  // Bold and Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Unordered list items
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>');

  // Ordered list items
  html = html.replace(
    /^\d+\. (.+)$/gm,
    '<li class="ml-4 list-decimal">$1</li>',
  );

  // Wrap consecutive <li> in <ul>/<ol>
  html = html.replace(
    /(<li class="ml-4 list-disc">[\s\S]*?<\/li>(\n|$))+/g,
    (match) => `<ul class="my-2 space-y-1">${match}</ul>`,
  );
  html = html.replace(
    /(<li class="ml-4 list-decimal">[\s\S]*?<\/li>(\n|$))+/g,
    (match) => `<ol class="my-2 space-y-1">${match}</ol>`,
  );

  // Paragraphs: wrap non-tagged lines
  html = html
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      if (
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<ul") ||
        trimmed.startsWith("<ol") ||
        trimmed.startsWith("<li") ||
        trimmed.startsWith("<div") ||
        trimmed.startsWith("<img") ||
        trimmed.startsWith("<a") ||
        trimmed.startsWith("</")
      ) {
        return line;
      }
      return `<p class="my-2">${trimmed}</p>`;
    })
    .join("\n");

  return html;
}

export default function SyllabusDetailPage({
  params,
}: {
  params: Promise<{ slug: string; subSlug: string; syllabusSlug: string }>;
}) {
  const { slug, subSlug, syllabusSlug } = use(params);
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await syllabusService.getBySlug(syllabusSlug);
        setSyllabus(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [syllabusSlug]);

  if (loading) {
    return (
              <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-muted-foreground py-12">
            লোড হচ্ছে...
          </p>
        </div>
    );
  }

  if (!syllabus) {
    return (
              <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-muted-foreground py-12">
            সিলেবাস পাওয়া যায়নি
          </p>
        </div>
    );
  }

  return (
          <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/exams/${slug}/${subSlug}/syllabus`}>
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">
            {syllabus.title}
          </h1>
        </div>

        {/* Content */}
        <Card className="mt-6">
          <CardContent className="py-4 prose prose-sm max-w-none">
            <div
              dangerouslySetInnerHTML={{
                __html: renderContent(syllabus.content),
              }}
            />
          </CardContent>
        </Card>
      </div>
  );
}
