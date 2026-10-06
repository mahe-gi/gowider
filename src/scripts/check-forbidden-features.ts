import fs from "node:fs";
import path from "node:path";

/**
 * Production Firewall Audit Script (TASK-21)
 *
 * Scans runtime source files (excluding documentation, test artifacts, and markdown)
 * for forbidden V2 features:
 * - Razorpay, Stripe, subscriptions
 * - Custom domains
 * - Video binary upload handlers
 * - Vimeo
 * - Redis
 */

const FORBIDDEN_PATTERNS = [
  { pattern: /\brazorpay\b/i, name: "Razorpay" },
  { pattern: /\bstripe\b/i, name: "Stripe" },
  { pattern: /\bsubscription(s)?\b/i, name: "Subscriptions" },
  { pattern: /\bcustom_domain(s)?\b/i, name: "Custom Domains" },
  { pattern: /\bvimeo\b/i, name: "Vimeo" },
  { pattern: /\bioredis\b/i, name: "Redis" },
  { pattern: /\b@upstash\/redis\b/i, name: "Upstash Redis" },
  { pattern: /\bmultipart\/form-data\b/i, name: "Binary Form Upload" },
];

const SCAN_DIRECTORIES = ["src", "drizzle"];
const SCAN_FILES = ["package.json", "next.config.ts"];

const IGNORED_EXTENSIONS = [".md", ".png", ".jpg", ".svg", ".ico"];

function scanFile(filePath: string, violations: string[]): void {
  const content = fs.readFileSync(filePath, "utf-8");

  for (const { pattern, name } of FORBIDDEN_PATTERNS) {
    if (pattern.test(content)) {
      violations.push(`Violation in ${filePath}: Found forbidden token "${name}"`);
    }
  }
}

function scanDir(dirPath: string, violations: string[]): void {
  if (!fs.existsSync(dirPath)) return;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".next" && entry.name !== "scripts") {
        scanDir(fullPath, violations);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (!IGNORED_EXTENSIONS.includes(ext) && !entry.name.endsWith(".md")) {
        scanFile(fullPath, violations);
      }
    }
  }
}

export function runForbiddenFeaturesAudit(): { passed: boolean; violations: string[] } {
  const root = process.cwd();
  const violations: string[] = [];

  for (const dir of SCAN_DIRECTORIES) {
    scanDir(path.join(root, dir), violations);
  }

  for (const file of SCAN_FILES) {
    const filePath = path.join(root, file);
    if (fs.existsSync(filePath)) {
      scanFile(filePath, violations);
    }
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("Running Forbidden Features Firewall Audit...");
  const result = runForbiddenFeaturesAudit();

  if (!result.passed) {
    console.error("FAIL: Forbidden features detected in runtime codebase:");
    for (const v of result.violations) {
      console.error(`  - ${v}`);
    }
    process.exit(1);
  } else {
    console.log("PASS: Zero forbidden V2 features found in runtime codebase.");
    process.exit(0);
  }
}
