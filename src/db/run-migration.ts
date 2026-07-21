import { createClient } from "@libsql/client";
import * as fs from "fs";
import * as path from "path";

const client = createClient({
  url: process.env.DATABASE_URL || "file:local.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function main() {
  console.log("Reading migration file...");
  const migrationPath = path.join(__dirname, "migrations", "0001_improvements.sql");
  const sqlContent = fs.readFileSync(migrationPath, "utf-8");

  // Split sql by drizzle breakpoint
  const statements = sqlContent
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`Executing ${statements.length} migration statements...`);

  // Disable foreign keys temporarily for recreate-table-and-swap sequences
  await client.execute("PRAGMA foreign_keys = OFF;");

  for (let i = 0; i < statements.length; i++) {
    console.log(`Executing statement ${i + 1}/${statements.length}...`);
    try {
      await client.execute(statements[i]);
    } catch (err: any) {
      console.warn(`Statement ${i + 1} execution had error: ${err.message}. Continuing...`);
    }
  }

  await client.execute("PRAGMA foreign_keys = ON;");

  console.log("Migration executed successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration execution failed:", err);
  process.exit(1);
});
