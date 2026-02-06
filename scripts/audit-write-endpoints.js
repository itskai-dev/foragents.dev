#!/usr/bin/env node
/*
  Audit: Next.js route handlers under src/app/api/.../route.ts

  Flags write endpoints (POST/PUT/PATCH/DELETE) that appear to be missing:
   - Body size cap: readJsonWithLimit/readTextWithLimit
   - Rate limit: checkRateLimit

  Intentionally simple + conservative. False positives are acceptable.
*/

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("fs");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("path");

const API_ROOT = path.join(process.cwd(), "src", "app", "api");
const BASELINE_PATH = path.join(process.cwd(), "scripts", "audit-write-endpoints.baseline.txt");

const WRITE_METHODS = ["POST", "PUT", "PATCH", "DELETE"];

function walk(dir) {
  /** @type {string[]} */
  const out = [];
  if (!fs.existsSync(dir)) return out;

  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }

  return out;
}

function isWriteRouteHandler(src) {
  const fnRe = new RegExp(`export\\s+(async\\s+)?function\\s+(${WRITE_METHODS.join("|")})\\s*\\(`);
  const constRe = new RegExp(`export\\s+const\\s+(${WRITE_METHODS.join("|")})\\s*=`);
  return fnRe.test(src) || constRe.test(src);
}

function hasBodyCap(src) {
  return /readJsonWithLimit\s*\(/.test(src) || /readTextWithLimit\s*\(/.test(src);
}

function hasRateLimit(src) {
  return /checkRateLimit\s*\(/.test(src);
}

function main() {
  const files = walk(API_ROOT).filter((f) => f.endsWith(`${path.sep}route.ts`));

  /** @type {{file:string, reasons:string[]}[]} */
  const flagged = [];

  for (const file of files) {
    const src = fs.readFileSync(file, "utf8");
    if (!isWriteRouteHandler(src)) continue;

    const reasons = [];
    if (!hasBodyCap(src)) reasons.push("missing body cap (readJsonWithLimit/readTextWithLimit)");
    if (!hasRateLimit(src)) reasons.push("missing rate limit (checkRateLimit)");

    if (reasons.length) flagged.push({ file: path.relative(process.cwd(), file), reasons });
  }

  if (!flagged.length) {
    console.log(`audit-write-endpoints: OK (${files.length} route files scanned)`);
    return;
  }

  const flaggedPaths = new Set(flagged.map((f) => f.file));

  /** @type {Set<string>} */
  let baseline = new Set();
  if (fs.existsSync(BASELINE_PATH)) {
    const raw = fs.readFileSync(BASELINE_PATH, "utf8");
    baseline = new Set(
      raw
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("#"))
    );
  }

  const newViolations = [...flaggedPaths].filter((p) => !baseline.has(p));
  const resolved = [...baseline].filter((p) => !flaggedPaths.has(p));

  if (!newViolations.length) {
    console.log(`audit-write-endpoints: WARN (${flagged.length} existing violations; no new ones)`);
    if (resolved.length) {
      console.log("\nResolved (consider removing from baseline):");
      for (const p of resolved) console.log(`- ${p}`);
    }
    return;
  }

  console.error("audit-write-endpoints: FAIL (new violations)\n");

  for (const f of flagged.filter((x) => new Set(newViolations).has(x.file))) {
    console.error(`- ${f.file}`);
    for (const r of f.reasons) console.error(`  - ${r}`);
  }

  console.error(`\nTip: Every write endpoint should include BOTH a body size cap + rate limit.`);
  console.error(`Baseline: ${path.relative(process.cwd(), BASELINE_PATH)}`);
  process.exit(1);
}

main();
