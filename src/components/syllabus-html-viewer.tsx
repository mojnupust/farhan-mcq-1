"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Renders HTML content inside a sandboxed iframe that auto-resizes to fit.
 * Used for displaying Claude-generated HTML syllabus content.
 */
export function SyllabusHtmlViewer({ content }: { content: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(400);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(content);
    doc.close();

    // Auto-resize iframe to content height
    const resizeObserver = new ResizeObserver(() => {
      const body = doc.body;
      if (body) {
        setHeight(body.scrollHeight + 20);
      }
    });

    const checkReady = () => {
      if (doc.body) {
        resizeObserver.observe(doc.body);
        setHeight(doc.body.scrollHeight + 20);
      }
    };

    iframe.addEventListener("load", checkReady);
    checkReady();

    return () => {
      resizeObserver.disconnect();
      iframe.removeEventListener("load", checkReady);
    };
  }, [content]);

  return (
    <iframe
      ref={iframeRef}
      className="w-full border-0 rounded-lg"
      style={{ height: `${height}px` }}
      sandbox="allow-scripts allow-same-origin"
      title="সিলেবাস কন্টেন্ট"
    />
  );
}
