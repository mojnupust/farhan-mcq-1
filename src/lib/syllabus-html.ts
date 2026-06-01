const namedEntities: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: "\u00A0",
};

export function decodeHtmlEntities(content: string): string {
  return content.replace(
    /&(#x?[0-9a-fA-F]+|amp|lt|gt|quot|apos|nbsp);/g,
    (match, entity: string) => {
      const normalized = entity.toLowerCase();

      if (normalized in namedEntities) {
        return namedEntities[normalized]!;
      }

      if (normalized.startsWith("#x")) {
        const codePoint = Number.parseInt(normalized.slice(2), 16);
        return Number.isNaN(codePoint)
          ? match
          : String.fromCodePoint(codePoint);
      }

      if (normalized.startsWith("#")) {
        const codePoint = Number.parseInt(normalized.slice(1), 10);
        return Number.isNaN(codePoint)
          ? match
          : String.fromCodePoint(codePoint);
      }

      return match;
    },
  );
}

export function looksLikeHtmlContent(content: string): boolean {
  const normalized = decodeHtmlEntities(content).trimStart();

  return /^<(?:!doctype|html|head|body|style|script|div|section|main|article|p|h[1-6]|ul|ol|table|iframe)\b/i.test(
    normalized,
  );
}

export function normalizeSyllabusHtml(content: string): string {
  return decodeHtmlEntities(content);
}
