import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import * as login from "./routes/login.js";
import * as conversations from "./routes/conversations.js";
import * as messages from "./routes/messages.js";
import * as webhook from "./routes/webhook.js";

export const app = new Hono();
app.use("*", bodyLimit({ maxSize: 1024 * 1024, onError: (c) => c.json({ error: "Request too large" }, 413) }));
app.get("/health", (c) => c.json({ ok: true, service: "line-desk-api" }));
app.post("/api/login", (c) => login.POST(c.req.raw));
app.delete("/api/login", () => login.DELETE());
app.get("/api/conversations", (c) => conversations.GET(c.req.raw));
app.post("/api/messages", (c) => messages.POST(c.req.raw));
app.post("/api/webhook", (c) => webhook.POST(c.req.raw));
app.onError(() => Response.json({ error: "Internal server error" }, { status: 500 }));
