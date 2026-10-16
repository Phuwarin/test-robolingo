import { Hono } from "hono";
import * as controller from "./conversations.controller.js";
export const routes = new Hono();
routes.get("/", (c) => controller.GET(c.req.raw));
