import { z } from "zod";

import { zValidator } from "@hono/zod-validator";

import { Hono } from "hono";
import { handle } from "hono/vercel";

export const runtime = "edge";

const app = new Hono().basePath("/apis");

app
  .get("/hello", (c) => {
    return c.json({
      message: "Hello Next.js!",
    });
  })
  .get(
    "/hello/:test",
    zValidator("param", z.object({ test: z.string() })),
    (c) => {
      // const test = c.req.param("test");
      // if we use zod-validator, we can access the validated params like this:
      const { test } = c.req.valid("param");
      return c.json({
        message: "Hello world",
        test,
      });
    }
  )
  .post(
    "/create/:postId",
    // * b/w the route and and c (context) is a middleware
    zValidator("json", z.object({ name: z.string(), userId: z.string() })),
    zValidator("param", z.object({ postId: z.number() })),
    (c) => {
      const { name, userId } = c.req.valid("json");
      const { postId } = c.req.valid("param");
      return c.json({});
    }
  );

export const GET = handle(app);
export const POST = handle(app);
