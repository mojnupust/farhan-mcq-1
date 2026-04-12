/**
 * Migration script: Remove CURRENT_USER and AppLayout from all pages.
 * AppLayout is now handled by (member)/layout.tsx and (admin)/layout.tsx.
 *
 * Run: node scripts/remove-current-user.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, "..", "src", "app");

function findPages(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findPages(full));
    } else if (/^page\.(tsx|jsx)$/.test(entry.name)) {
      const content = fs.readFileSync(full, "utf-8");
      if (content.includes("CURRENT_USER")) {
        results.push(full);
      }
    }
  }
  return results;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  const original = content;

  // 1. Remove the AppLayout import line
  content = content.replace(
    /import\s*\{\s*AppLayout\s*\}\s*from\s*["']@\/components\/layout\/app-layout["'];\s*\n/g,
    "",
  );

  // 2. Remove the CURRENT_USER block (with optional comment line above)
  content = content.replace(
    /\/\/\s*TODO:.*\n\s*const CURRENT_USER\s*=\s*\{[^}]*\};\s*\n/g,
    "",
  );
  // Also handle without TODO comment
  content = content.replace(
    /\nconst CURRENT_USER\s*=\s*\{[^}]*\};\s*\n/g,
    "\n",
  );

  // 3. Replace <AppLayout user={CURRENT_USER} ...> with just the inner content
  //    Match: <AppLayout user={CURRENT_USER} isAdmin={true/false} unreadMessages={...}>
  content = content.replace(
    /<AppLayout\s+user=\{CURRENT_USER\}[^>]*>\s*\n/g,
    "",
  );
  // Also handle single-line opening tags
  content = content.replace(/<AppLayout\s+user=\{CURRENT_USER\}[^>]*>/g, "");

  // 4. Replace </AppLayout> closing tags
  //    Handle "    </AppLayout>" with indentation
  content = content.replace(/\s*<\/AppLayout>\s*\n/g, "\n");
  content = content.replace(/<\/AppLayout>/g, "");

  // 5. Clean up extra blank lines (more than 2 consecutive)
  content = content.replace(/\n{3,}/g, "\n\n");

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(
      `✓ Updated: ${path.relative(path.join(__dirname, ".."), filePath)}`,
    );
    return true;
  }
  console.log(
    `- Skipped (no changes): ${path.relative(path.join(__dirname, ".."), filePath)}`,
  );
  return false;
}

const pages = findPages(srcDir);
console.log(`Found ${pages.length} pages with CURRENT_USER\n`);

let updated = 0;
for (const page of pages) {
  if (processFile(page)) updated++;
}

console.log(`\nDone! Updated ${updated}/${pages.length} files.`);
