/**
 * HTML Sanitizer — prevents XSS attacks by stripping dangerous tags/attributes
 * while preserving safe formatting HTML.
 *
 * Used for any user-generated or API-sourced content rendered via dangerouslySetInnerHTML.
 */

// Tags that are safe to render (educational content formatting)
const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "del",
  "ins",
  "mark",
  "small",
  "sub",
  "sup",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "dl",
  "dt",
  "dd",
  "blockquote",
  "pre",
  "code",
  "span",
  "div",
  "a",
  "img",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "caption",
  "figure",
  "figcaption",
  "hr",
  "details",
  "summary",
  "iframe",
]);

// Attributes that are safe on any element
const ALLOWED_GLOBAL_ATTRS = new Set([
  "class",
  "id",
  "dir",
  "lang",
  "title",
  "role",
  "aria-label",
  "aria-hidden",
  "aria-describedby",
  "data-testid",
]);

// Tag-specific allowed attributes
const ALLOWED_TAG_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "target", "rel"]),
  img: new Set(["src", "alt", "width", "height", "loading"]),
  iframe: new Set([
    "src",
    "width",
    "height",
    "frameborder",
    "allowfullscreen",
    "loading",
    "allow",
  ]),
  td: new Set(["colspan", "rowspan"]),
  th: new Set(["colspan", "rowspan", "scope"]),
  ol: new Set(["start", "type"]),
  li: new Set(["value"]),
};

// Only allow these URL schemes
const SAFE_URL_SCHEMES = /^(https?:\/\/|mailto:|tel:|\/|#|data:image\/)/i;

// Dangerous patterns to strip from attribute values
const DANGEROUS_ATTR_PATTERN =
  /javascript:|vbscript:|data:text\/html|expression\s*\(|url\s*\(/i;

// Only allow YouTube embeds in iframes
const ALLOWED_IFRAME_HOSTS = [
  "www.youtube.com",
  "youtube.com",
  "www.youtube-nocookie.com",
];

/**
 * Sanitize HTML string by removing dangerous tags, attributes, and URL schemes.
 * Keeps only safe formatting and content elements.
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return "";

  // Remove script tags and their content entirely
  let html = dirty.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    "",
  );

  // Remove style tags and their content entirely
  html = html.replace(
    /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
    "",
  );

  // Remove event handler attributes (onclick, onerror, onload, etc.)
  html = html.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "");

  // Remove javascript: hrefs
  html = html.replace(
    /(<[^>]*\s)(href|src|action)\s*=\s*["']?\s*javascript:[^"'>\s]*/gi,
    "$1$2=\"\"",
  );

  // Strip disallowed tags but keep their inner content
  html = html.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (match, tagName) => {
    const tag = tagName.toLowerCase();

    if (!ALLOWED_TAGS.has(tag)) {
      // Strip the tag but keep content (except for known dangerous tags)
      if (
        tag === "script" ||
        tag === "style" ||
        tag === "object" ||
        tag === "embed" ||
        tag === "applet"
      ) {
        return "";
      }
      return "";
    }

    // For allowed tags, sanitize their attributes
    return sanitizeTagAttributes(match, tag);
  });

  return html;
}

function sanitizeTagAttributes(tag: string, tagName: string): string {
  // Self-closing or void tags
  const isClosing = tag.startsWith("</");
  if (isClosing) return `</${tagName}>`;

  const isSelfClosing = tag.endsWith("/>");

  // Extract attributes
  const attrRegex =
    /\s+([a-z][a-z0-9_-]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/gi;
  const safeAttrs: string[] = [];
  let attrMatch: RegExpExecArray | null;

  while ((attrMatch = attrRegex.exec(tag)) !== null) {
    const attrName = attrMatch[1].toLowerCase();
    const attrValue = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? "";

    // Check if this attribute is allowed
    const isGlobalAllowed = ALLOWED_GLOBAL_ATTRS.has(attrName);
    const isTagSpecific = ALLOWED_TAG_ATTRS[tagName]?.has(attrName);

    if (!isGlobalAllowed && !isTagSpecific) continue;

    // Validate URL-type attributes
    if (attrName === "href" || attrName === "src" || attrName === "action") {
      if (DANGEROUS_ATTR_PATTERN.test(attrValue)) continue;
      if (!SAFE_URL_SCHEMES.test(attrValue) && attrValue !== "") continue;

      // For iframes, only allow known safe hosts
      if (tagName === "iframe" && attrName === "src") {
        try {
          const url = new URL(attrValue);
          if (!ALLOWED_IFRAME_HOSTS.includes(url.hostname)) continue;
        } catch {
          continue;
        }
      }
    }

    // Validate attribute values don't contain dangerous patterns
    if (DANGEROUS_ATTR_PATTERN.test(attrValue)) continue;

    safeAttrs.push(`${attrName}="${escapeAttrValue(attrValue)}"`);
  }

  // Force safe attributes on specific tags
  if (tagName === "a") {
    if (!safeAttrs.some((a) => a.startsWith("rel="))) {
      safeAttrs.push('rel="noopener noreferrer"');
    }
  }

  const attrsStr = safeAttrs.length > 0 ? " " + safeAttrs.join(" ") : "";
  return `<${tagName}${attrsStr}${isSelfClosing ? " /" : ""}>`;
}

function escapeAttrValue(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Escape all HTML — for rendering untrusted text as plain text.
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
