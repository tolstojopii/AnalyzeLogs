import { Migrator, type MigrationProvider } from "kysely";
import { db } from "./index";
import { migrations } from "./migrations";

const provider: MigrationProvider = {
  async getMigrations() {
    return migrations;
  },
};

async function main() {
  const migrator = new Migrator({ db, provider });
  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(`applied ${it.migrationName}`);
    } else if (it.status === "Error") {
      console.error(`failed  ${it.migrationName}`);
    }
  });

  if (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }

  console.log("All migrations applied.");
  await db.destroy();
}

main();