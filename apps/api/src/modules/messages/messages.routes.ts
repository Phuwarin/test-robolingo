import { Hono } from "hono";
import * as controller from "./messages.controller.js";
export const routes = new Hono();
routes.post("/", (c) => controller.POST(c.req.raw));
