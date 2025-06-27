const fs = require("fs");
const path = require("path");

const RULES_PATH = path.resolve(".cursor/rules/nx-rules.mdc");

const SUSPICIOUS_KEYWORDS = [
  "exec",
  "curl",
  "wget",
  "base64",
  "eval",
  "require(",
  "child_process",
  "spawn",
  "process.exit",
  "setInterval(",
  "setTimeout(",
];

const UNICODE_DANGER_CODES = [
  "\u200B", // Zero Width Space
  "\u200E", // Left-To-Right Mark
  "\u200F", // Right-To-Left Mark
  "\u202E", // RTL override
  "\u2066",
  "\u2067",
  "\u2068",
  "\u2069", // bidirectional isolates
];

function checkUnicode(line, lineNumber) {
  const found = [];
  for (const code of UNICODE_DANGER_CODES) {
    if (line.includes(code)) {
      found.push(code);
    }
  }
  if (found.length > 0) {
    console.warn(
      `[Unicode Warning] Line ${lineNumber}: Contains hidden Unicode characters: ${found.map(
        (c) => `U+${c.charCodeAt(0).toString(16).toUpperCase()}`
      )}`
    );
  }
}

function checkSuspicious(line, lineNumber) {
  for (const keyword of SUSPICIOUS_KEYWORDS) {
    if (line.includes(keyword)) {
      console.warn(
        `[Suspicious Keyword] Line ${lineNumber}: Found "${keyword}"`
      );
    }
  }
}

function checkEmptyHeader(line, lineNumber) {
  if (line.startsWith("description:") && line.trim() === "description:") {
    console.warn(`[Warning] Line ${lineNumber}: Empty description`);
  }
}

function main() {
  if (!fs.existsSync(RULES_PATH)) {
    console.error(`File not found: ${RULES_PATH}`);
    process.exit(1);
  }

  const lines = fs.readFileSync(RULES_PATH, "utf-8").split("\n");

  lines.forEach((line, index) => {
    checkUnicode(line, index + 1);
    checkSuspicious(line, index + 1);
    checkEmptyHeader(line, index + 1);
  });

  console.log("✅ Check complete.");
}

main();
