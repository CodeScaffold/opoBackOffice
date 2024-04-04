import Koa from "koa";
import Router from "@koa/router";
import cors from "@koa/cors";
import { prisma } from "./src/database";
import koaBody from "koa-body";
import { DefaultArgs, GetFindResult } from "@prisma/client/runtime/library";
import { Prisma } from "@prisma/client";
import serve from "koa-static";
import path from "path";

const app = new Koa();
const router = new Router();

// Serve static files from the 'public' directory
app.use(serve(path.join(__dirname, "public")));

app.use(
  koaBody({
    multipart: true,
    json: true,
    formidable: {
      maxFileSize: 100 * 1024 * 1024,
    },
  }),
);

router.post("/login", async (ctx) => {
  const { username, password } = ctx.request.body;
  const users = [
    { username: "arash", password: "password" },
    // Add more users as needed
  ];

  const foundUser = users.find(
    (user) => user.username === username && user.password === password,
  );

  if (foundUser) {
    ctx.body = { success: true, message: "Login successful" };
    ctx.status = 200;
  } else {
    ctx.status = 401;
    ctx.body = { success: false, message: "Invalid username or password" };
  }
});

// Define routes
router.get("/", async (ctx) => {
  ctx.body = "Hello, Koa!";
});

// Define a route for fetching results
router.get("/result", async (ctx) => {
  try {
    const results = await prisma.result.findMany({
      where: {
        archivedAt: null,
      },
    });
    ctx.body = results;
  } catch (error) {
    console.error("Error fetching results:", error);
    ctx.status = 500;
    ctx.body = { error: "Failed to fetch results" };
  }
});
// Patch route for updating result checks
router.patch("/result/:id", async (ctx) => {
  const { id } = ctx.params;
  const { firstCheck, secondCheck } = ctx.request.body;

  try {
    const result = await prisma.result.update({
      where: { id: Number(id) },
      data: {
        firstCheck,
        secondCheck,
        archivedAt: firstCheck && secondCheck ? new Date() : null,
      },
    });
    ctx.body = result;
  } catch (error: unknown) {
    console.error("Failed to update result:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    ctx.status = 500;
    ctx.body = { error: "Failed to update result", details: message };
  }
});

router.post("/result", async (ctx) => {
  if (!ctx.request.body.reason) {
    ctx.status = 400;
    ctx.body = "Reason is required!";
    return;
  }

  const existData = await prisma.result.findUnique({
    where: {
      ticket: ctx.request.body.ticket,
    },
  });

  if (existData) {
    ctx.status = 400;
    ctx.body = "This ticket is already exist in database";
    return;
  }

  const {
    ticket,
    tp,
    sl,
    pair,
    lot,
    closePrice,
    reason,
    difference,
    compensateInUsd,
  } = ctx.request.body;

  try {
    const savedResult = await prisma.result.create({
      data: {
        ticket,
        pair,
        lot: parseFloat(lot),
        tp: parseFloat(tp),
        sl: parseFloat(sl),
        closePrice: parseFloat(closePrice),
        reason,
        difference,
        compensate: compensateInUsd,
      },
    });
    ctx.status = 200;
    ctx.body = savedResult;
  } catch (error) {
    console.error("Failed to save result:", error);
    const message =
      typeof error === "object" && error !== null && "message" in error
        ? error.message
        : "Unknown error";
    ctx.status = 500;
    ctx.body = { error: "Failed to save data", details: message };
  }
});

// Use routes
app.use(cors());
app.use(router.routes());
app.use(router.allowedMethods());

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
