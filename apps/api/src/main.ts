import { createApp } from "./app.js";
import { Logger } from "@nestjs/common";
const app = await createApp();
app.enableShutdownHooks();
const port = Number(process.env.PORT || 4099);
await app.listen(port);
Logger.log(`API listening at http://localhost:${port}`, "Bootstrap");
