import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { serve } from "@hono/node-server";
import { app } from "./app.js";

config({ path: fileURLToPath(new URL("../.env", import.meta.url)), quiet: true });
const port = Number(process.env.PORT || 4099);
const server = serve({ fetch: app.fetch, port }, () => console.log(`API ready at http://localhost:${port}`));
for (const signal of ["SIGINT", "SIGTERM"] as const) process.on(signal, () => server.close(() => process.exit(0)));
