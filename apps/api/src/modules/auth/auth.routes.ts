import { Hono } from "hono";
import * as controller from "./auth.controller.js";
export const routes = new Hono();
routes.post("/", (c) => controller.POST(c.req.raw));
routes.delete("/", () => controller.DELETE());
