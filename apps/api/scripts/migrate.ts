import { Sequelize } from "sequelize-typescript";
import { QueryTypes } from "sequelize";
if (!process.env.DB_PASSWORD) throw new Error("Set DB_PASSWORD in apps/api/.env before running migrations");
const database = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 5433),
  database: process.env.DB_NAME || "line_desk",
  username: process.env.DB_USER || "line_desk",
  password: process.env.DB_PASSWORD,
  logging: false,
});
try {
  await database.transaction(async (transaction) => {
    await database.query("SELECT pg_advisory_xact_lock(2012053539)", {
      transaction,
    });
    const [tables] = await database.query<{ contacts: string | null; users: string | null }>("SELECT to_regclass('contacts') AS contacts,to_regclass('line_users') AS users", {
      type: QueryTypes.SELECT,
      transaction,
    });
    const path = tables.contacts || tables.users ? "../migrations/002_sequelize_models.sql" : "../schema.sql";
    await database.query(await Bun.file(new URL(path, import.meta.url)).text(), {
      transaction,
    });
    await database.query(await Bun.file(new URL("../migrations/003_timestamps.sql", import.meta.url)).text(), {
      transaction,
    });
    await database.query(await Bun.file(new URL("../migrations/004_remove_followed_at.sql", import.meta.url)).text(), {
      transaction,
    });
    await database.query(await Bun.file(new URL("../migrations/005_message_direction.sql", import.meta.url)).text(), {
      transaction,
    });
    await database.query(await Bun.file(new URL("../migrations/006_last_message_id.sql", import.meta.url)).text(), {
      transaction,
    });
    await database.query(await Bun.file(new URL("../migrations/007_line_message_id.sql", import.meta.url)).text(), { transaction });
    await database.query(await Bun.file(new URL("../migrations/008_unread_count.sql", import.meta.url)).text(), { transaction });
    await database.query(await Bun.file(new URL("../migrations/009_internal_ids.sql", import.meta.url)).text(), { transaction });
    await database.query(await Bun.file(new URL("../migrations/010_last_message_time.sql", import.meta.url)).text(), { transaction });
  });
  console.log("Database migration completed");
} finally {
  await database.close();
}
