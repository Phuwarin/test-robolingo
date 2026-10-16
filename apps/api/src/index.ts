import { app } from "./app.js";
const port = Number(process.env.PORT || 4099);
const server = Bun.serve({ port, fetch: app.fetch });
console.log(`API ready at http://localhost:${server.port}`);
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.on(signal, () => {
    void server.stop(true);
    process.exit(0);
  });
