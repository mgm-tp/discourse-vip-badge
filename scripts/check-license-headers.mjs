// SPDX-License-Identifier: MIT
// Copyright (c) 2026 to present mgm technology partners GmbH
// See LICENSE file for details.

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

/** License header lines, without comment markers. */
const HEADER_LINES = [
  "SPDX-License-Identifier: MIT",
  "Copyright (c) 2026 to present mgm technology partners GmbH",
  "See LICENSE file for details.",
];

/** Comment styles keyed by id. */
const STYLES = {
  hash: { prefix: "# ", suffix: "" },
  slash: { prefix: "// ", suffix: "" },
  html: { prefix: "<!-- ", suffix: " -->" },
};

const HASH_EXT = new Set([".rb", ".yml", ".yaml"]);
const SLASH_EXT = new Set([".js", ".gjs", ".mjs", ".cjs", ".scss"]);
const HTML_EXT = new Set([".md"]);
const HASH_NAMES = new Set([
  "Gemfile",
  ".npmrc",
  ".streerc",
  ".discourse-compatibility",
  ".gitignore",
]);

/** SPDX marker used to detect an existing header. */
const MARKER = "SPDX-License-Identifier: MIT";

/**
 * Classify a repo-relative path into a comment-style id, or null when the
 * file is out of scope (excluded, binary, or unknown).
 * @param {string} relPath
 * @returns {"hash"|"slash"|"html"|null}
 */
export function classifyPath(relPath) {
  const base = relPath.split("/").pop();
  if (
    relPath.startsWith(".ruby-lsp/") ||
    base === "LICENSE" ||
    base === "pnpm-lock.yaml" ||
    base.endsWith(".json") ||
    base.endsWith(".lock")
  ) {
    return null;
  }
  const dot = base.lastIndexOf(".");
  const ext = dot > 0 ? base.slice(dot) : "";
  if (HASH_NAMES.has(base) || HASH_EXT.has(ext)) return "hash";
  if (SLASH_EXT.has(ext)) return "slash";
  if (HTML_EXT.has(ext)) return "html";
  return null;
}

/**
 * Render the license header for a comment style.
 * @param {"hash"|"slash"|"html"} styleId
 * @returns {string[]}
 */
export function renderHeader(styleId) {
  const { prefix, suffix } = STYLES[styleId];
  return HEADER_LINES.map((line) => `${prefix}${line}${suffix}`);
}

/**
 * Whether the content already carries the license header (checks the top
 * of the file only, so a stray mention lower down does not count).
 * @param {string} content
 * @returns {boolean}
 */
export function hasHeader(content) {
  return content
    .split("\n")
    .slice(0, 10)
    .some((line) => line.includes(MARKER));
}

/**
 * Index of the line where the header should be inserted: after a leading
 * shebang and Ruby magic comments for hash-style files, otherwise the top.
 * @param {string[]} lines
 * @param {"hash"|"slash"|"html"} styleId
 * @returns {number}
 */
export function findInsertionIndex(lines, styleId) {
  if (styleId !== "hash") return 0;
  let i = 0;
  if (lines[i]?.startsWith("#!")) i++;
  while (
    lines[i] !== undefined &&
    /^#.*\b(frozen_string_literal|coding|encoding)\b/.test(lines[i])
  ) {
    i++;
  }
  return i;
}

/**
 * Insert the license header into content. Caller must check hasHeader first.
 * Preserves a leading shebang / Ruby magic comments and normalises blank
 * lines so exactly one blank separates the header from the body.
 * @param {string} content
 * @param {"hash"|"slash"|"html"} styleId
 * @returns {string}
 */
export function applyHeader(content, styleId) {
  const lines = content.split("\n");
  const idx = findInsertionIndex(lines, styleId);
  const prefix = lines.slice(0, idx);
  const rest = lines.slice(idx);
  while (rest.length && rest[0].trim() === "") rest.shift();
  const sep =
    prefix.length && prefix[prefix.length - 1].trim() !== "" ? [""] : [];
  return [...prefix, ...sep, ...renderHeader(styleId), "", ...rest].join("\n");
}

/** CLI entry: check (default) or apply (--fix) headers across tracked files. */
function main() {
  const fix = process.argv.includes("--fix");
  const files = execFileSync("git", ["ls-files"], { encoding: "utf8" })
    .split("\n")
    .filter(Boolean);
  const missing = [];
  for (const file of files) {
    const styleId = classifyPath(file);
    if (!styleId) continue;
    const content = readFileSync(file, "utf8");
    if (hasHeader(content)) continue;
    if (fix) {
      writeFileSync(file, applyHeader(content, styleId));
    } else {
      missing.push(file);
    }
  }
  if (fix) {
    console.log("License headers applied.");
    return;
  }
  if (missing.length) {
    console.error(
      `Missing license header in ${missing.length} file(s):\n` +
        missing.map((f) => `  ${f}`).join("\n")
    );
    process.exit(1);
  }
  console.log("All files have a license header.");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
