// import { z } from "zod";
// import { zValidator } from "@hono/zod-validator";
// import { clerkMiddleware, getAuth } from "@hono/clerk-auth";

import { Hono } from "hono";
import { handle } from "hono/vercel";

import authors from "./authors";
import books from "./books";

export const runtime = "edge";

const app = new Hono().basePath("/apis");

app.route("/authors", authors);
app.route("/books", books);

export const GET = handle(app);
export const POST = handle(app);
