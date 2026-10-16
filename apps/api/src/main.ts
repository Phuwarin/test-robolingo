import { createApp } from "./app.js";
const app = await createApp();
app.enableShutdownHooks();
const port = Number(process.env.PORT || 4099);
await app.listen(port);
console.log(`NestJS API ready at http://localhost:${port}`);
