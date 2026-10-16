import { Hono } from "hono";
import * as controller from "./webhook.controller.js";
export const routes = new Hono();
routes.post("/", (c) => controller.POST(c.req.raw));
