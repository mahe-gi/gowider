import fs from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile();
  } catch {
    // ignore if missing
  }
}

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("ERROR: DATABASE_URL environment variable is missing.");
    process.exit(1);
  }

  console.log("Connecting to Neon PostgreSQL via HTTP...");
  const sql = neon(connectionString);

  try {
    // 1. Run 0000_wonderful_unus.sql
    const schemaSqlPath = path.join(process.cwd(), "drizzle", "0000_wonderful_unus.sql");
    if (fs.existsSync(schemaSqlPath)) {
      console.log("Applying 0000_wonderful_unus.sql (Tables, Enums, Constraints, Indexes)...");
      const rawSchemaSql = fs.readFileSync(schemaSqlPath, "utf-8");
      const statements = rawSchemaSql
        .split("--> statement-breakpoint")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        try {
          await sql.query(stmt);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          // If already exists (e.g. re-running migration), log and continue
          if (msg.includes("already exists")) {
            console.log(`Notice: Object already exists, skipping statement ${i + 1}`);
          } else {
            throw err;
          }
        }
      }
      console.log(`Applied ${statements.length} schema statements.`);
    }

    // 2. Run 0001_triggers.sql
    const triggerStatements = [
      `CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;`,
      `DROP TRIGGER IF EXISTS trg_user_updated_at ON "user";`,
      `CREATE TRIGGER trg_user_updated_at BEFORE UPDATE ON "user" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,
      `DROP TRIGGER IF EXISTS trg_account_updated_at ON "account";`,
      `CREATE TRIGGER trg_account_updated_at BEFORE UPDATE ON "account" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,
      `DROP TRIGGER IF EXISTS trg_session_updated_at ON "session";`,
      `CREATE TRIGGER trg_session_updated_at BEFORE UPDATE ON "session" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,
      `DROP TRIGGER IF EXISTS trg_profiles_updated_at ON "profiles";`,
      `CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON "profiles" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,
      `DROP TRIGGER IF EXISTS trg_social_links_updated_at ON "social_links";`,
      `CREATE TRIGGER trg_social_links_updated_at BEFORE UPDATE ON "social_links" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,
      `DROP TRIGGER IF EXISTS trg_services_updated_at ON "services";`,
      `CREATE TRIGGER trg_services_updated_at BEFORE UPDATE ON "services" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,
      `DROP TRIGGER IF EXISTS trg_skills_updated_at ON "skills";`,
      `CREATE TRIGGER trg_skills_updated_at BEFORE UPDATE ON "skills" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,
      `DROP TRIGGER IF EXISTS trg_portfolio_settings_updated_at ON "portfolio_settings";`,
      `CREATE TRIGGER trg_portfolio_settings_updated_at BEFORE UPDATE ON "portfolio_settings" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,
      `CREATE OR REPLACE FUNCTION trg_projects_update_fn()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.published_at IS NOT NULL AND NEW.slug <> OLD.slug THEN
        RAISE EXCEPTION 'Published project slug is strictly immutable (slug: %)', OLD.slug;
    END IF;
    
    IF OLD.published_at IS NULL AND NEW.is_published = true THEN
        NEW.published_at = now();
    END IF;

    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;`,
      `DROP TRIGGER IF EXISTS trg_projects_update ON "projects";`,
      `CREATE TRIGGER trg_projects_update BEFORE UPDATE ON "projects" FOR EACH ROW EXECUTE FUNCTION trg_projects_update_fn();`,
      `CREATE OR REPLACE FUNCTION trg_projects_pre_delete_fn()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE reports 
    SET project_id = NULL 
    WHERE project_id = OLD.id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;`,
      `DROP TRIGGER IF EXISTS trg_projects_pre_delete ON "projects";`,
      `CREATE TRIGGER trg_projects_pre_delete BEFORE DELETE ON "projects" FOR EACH ROW EXECUTE FUNCTION trg_projects_pre_delete_fn();`
    ];

    console.log("Applying triggers and functions...");
    for (const stmt of triggerStatements) {
      await sql.query(stmt);
    }
    console.log("Applied trigger definitions.");

    console.log("SUCCESS: All database tables, enums, indexes, and triggers applied to Neon!");
  } catch (error) {
    console.error("FAIL: Migration failed:", error);
    process.exit(1);
  }
}

runMigrations();
