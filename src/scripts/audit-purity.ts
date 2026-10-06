import fs from "node:fs";
import path from "node:path";
import { assertDevelopmentEnvironment } from "@/db/fixtures/guard";

/**
 * Production Database & Fixture Purity Audit (TASK-21)
 *
 * Verifies:
 * 1. Fixture guard properly protects against execution in non-development environments.
 * 2. Runtime codebase contains zero embedded demo users ("Mahesh", "Rahul")
 *    or demo brands ("Nike", "Apple") in production schemas, seeds, or tables.
 */

const FORBIDDEN_DEMO_NAMES = [
  { pattern: /\bMahesh\b/i, name: 'Demo user "Mahesh"' },
  { pattern: /\bRahul\b/i, name: 'Demo user "Rahul"' },
  { pattern: /\bNike\b/i, name: 'Demo brand "Nike"' },
  { pattern: /\bApple\b/i, name: 'Demo brand "Apple"' },
];

export function auditFixtureProtection(): boolean {
  // Test that assertDevelopmentEnvironment throws in production
  const originalEnv = process.env.NODE_ENV;
  const envObj = process.env as Record<string, string | undefined>;
  try {
    envObj.NODE_ENV = "production";
    let threw = false;
    try {
      assertDevelopmentEnvironment();
    } catch {
      threw = true;
    }
    return threw;
  } finally {
    envObj.NODE_ENV = originalEnv;
  }
}

export function auditCodebasePurity(): { passed: boolean; violations: string[] } {
  const violations: string[] = [];
  const root = process.cwd();

  // Scan schema, db, and migrations
  const targetDirs = [
    path.join(root, "src", "db"),
    path.join(root, "drizzle"),
  ];

  for (const dir of targetDirs) {
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir, { recursive: true, withFileTypes: true });
    for (const f of files) {
      if (f.isFile() && (f.name.endsWith(".ts") || f.name.endsWith(".sql"))) {
        const fullPath = path.join(f.parentPath || dir, f.name);
        const content = fs.readFileSync(fullPath, "utf-8");

        for (const { pattern, name } of FORBIDDEN_DEMO_NAMES) {
          if (pattern.test(content)) {
            violations.push(`Found ${name} in ${fullPath}`);
          }
        }
      }
    }
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("Running Production Purity & Fixture Protection Audit...");

  const fixtureProtected = auditFixtureProtection();
  if (!fixtureProtected) {
    console.error("FAIL: assertDevelopmentEnvironment() failed to throw in production!");
    process.exit(1);
  }
  console.log("PASS: Fixture environment guard is active and secure.");

  const purityResult = auditCodebasePurity();
  if (!purityResult.passed) {
    console.error("FAIL: Forbidden demo data found in production schemas or migrations:");
    for (const v of purityResult.violations) {
      console.error(`  - ${v}`);
    }
    process.exit(1);
  }
  console.log("PASS: Zero fake production data found in schemas and migrations.");
  process.exit(0);
}
