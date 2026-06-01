"use client";

import { normalizeSyllabusHtml } from "@/lib/syllabus-html";
import { useEffect, useState } from "react";

/**
 * Wraps the HTML content with a script to post height back to parent.
 */
function wrapWithResizeScript(content: string): string {
  const resizeScript = `
<script>
(function() {
  function postHeight() {
    var h = document.documentElement.scrollHeight || document.body.scrollHeight;
    window.parent.postMessage({ type: 'syllabus-iframe-height', height: h }, '*');
  }
  window.addEventListener('load', postHeight);
  new MutationObserver(postHeight).observe(document.body, { childList: true, subtree: true, attributes: true });
  setTimeout(postHeight, 100);
  setTimeout(postHeight, 500);
})();
</script>`;

  // Inject before closing </body> or at the end
  if (content.includes("</body>")) {
    return content.replace("</body>", `${resizeScript}</body>`);
  }
  return content + resizeScript;
}

/**
 * Renders HTML content inside a sandboxed iframe that auto-resizes to fit.
 * Used for displaying Claude-generated HTML syllabus content.
 */
export function SyllabusHtmlViewer({ content }: { content: string }) {
  const [height, setHeight] = useState(400);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (
        event.data &&
        event.data.type === "syllabus-iframe-height" &&
        typeof event.data.height === "number"
      ) {
        setHeight(event.data.height + 20);
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const srcdoc = wrapWithResizeScript(normalizeSyllabusHtml(content));

  return (
    <iframe
      srcDoc={srcdoc}
      className="w-full border-0 rounded-lg"
      style={{ height: `${height}px` }}
      sandbox="allow-scripts"
      title="সিলেবাস কন্টেন্ট"
    />
  );
}
