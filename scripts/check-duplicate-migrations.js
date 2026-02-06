/*
  CI Guard: fail if there are duplicate Supabase migration versions.

  Why:
  - In a busy repo, it's easy to merge two branches that both add e.g. 012_*.sql.
  - Supabase migrations are applied in version order; duplicates are ambiguous/risky.

  Expected filenames:
    supabase/migrations/<version>_<name>.sql

  Where <version> is typically a zero-padded integer (e.g., 012).
*/

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("node:fs");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const migrationsDir = path.join(repoRoot, "supabase", "migrations");

function isSqlFile(name) {
  return name.toLowerCase().endsWith(".sql");
}

function parseVersion(filename) {
  // Accept: 012_name.sql, 12_name.sql, etc.
  const m = /^([0-9]+)_/.exec(filename);
  if (!m) return null;
  return m[1];
}

function main() {
  if (!fs.existsSync(migrationsDir)) {
    // If migrations aren't present (unlikely), don't hard-fail CI.
    process.stdout.write(
      `[check-duplicate-migrations] migrations dir not found: ${migrationsDir} (skipping)\n`
    );
    return;
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter(isSqlFile)
    .sort((a, b) => a.localeCompare(b));

  const byVersion = new Map();
  const unversioned = [];

  for (const f of files) {
    const v = parseVersion(f);
    if (!v) {
      unversioned.push(f);
      continue;
    }
    const arr = byVersion.get(v) || [];
    arr.push(f);
    byVersion.set(v, arr);
  }

  const duplicates = [];
  for (const [v, arr] of byVersion.entries()) {
    if (arr.length > 1) duplicates.push({ version: v, files: arr });
  }

  if (unversioned.length) {
    process.stdout.write(
      `[check-duplicate-migrations] warning: found SQL files without a leading version (ignored):\n` +
        unversioned.map((f) => `  - ${f}`).join("\n") +
        "\n"
    );
  }

  if (duplicates.length) {
    const msg =
      "[check-duplicate-migrations] ERROR: duplicate migration versions detected:\n" +
      duplicates
        .sort((a, b) => Number(a.version) - Number(b.version))
        .map(
          (d) =>
            `\nVersion ${d.version}:\n` + d.files.map((f) => `  - ${f}`).join("\n")
        )
        .join("\n");

    process.stderr.write(`${msg}\n\nFix: rename one of the files to a new, unused version.\n`);
    process.exit(1);
  }

  process.stdout.write(
    `[check-duplicate-migrations] ok (${byVersion.size} versioned migration(s) checked)\n`
  );
}

main();
