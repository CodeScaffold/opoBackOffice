import Koa from "koa";
import Router from "@koa/router";
import cors from "@koa/cors";
import { prisma } from "./src/database";
import koaBody from "koa-body";
import serve from "koa-static";
import path from "path";
import bodyParser from "koa-bodyparser";
import passport from "koa-passport";
import dotenv from "dotenv";
import setupPassport from "./src/auth/passport";
import routes from "./src/routes";

dotenv.config();

const app = new Koa();
const router = new Router();

// Serve static files from the 'public' directory
app.use(serve(path.join(__dirname, "public")));
setupPassport(app);
app.use(
  koaBody({
    multipart: true,
    json: true,
    formidable: {
      maxFileSize: 100 * 1024 * 1024,
    },
  }),
);

app.use(bodyParser());
require("./src/auth/passport"); // This will run the code in your passport.ts
app.use(passport.initialize());

// Define routes
router.get("/", async (ctx) => {
  ctx.body = "Hello, Koa!";
});

// Define a route for fetching results

router.get("/result", async (ctx) => {
  const page = parseInt(ctx.query.page as string) || 1;
  const pageSize = parseInt(ctx.query.pageSize as string) || 10;
  const skip = (page - 1) * pageSize;
  try {
    const [results, totalResultsCount] = await Promise.all([
      prisma.result.findMany({
        where: {
          archivedAt: null,
        },
        skip: skip,
        take: pageSize,
        orderBy: [{ id: "desc" }],
      }),
      prisma.result.count({
        where: {
          archivedAt: null,
        },
      }),
    ]);

    ctx.body = { results, totalResultsCount };
  } catch (error) {
    console.error("Error fetching results:", error);
    ctx.status = 500;
    ctx.body = { error: "Failed to fetch results" };
  }
});
router.patch("/result/:id", async (ctx) => {
  const { id } = ctx.params;
  const { firstCheck, secondCheck } = ctx.request.body;

  try {
    const result = await prisma.result.update({
      where: { id: Number(id) },
      data: {
        firstCheck,
        secondCheck,
      },
    });

    if (secondCheck) {
      await prisma.result.update({
        where: { id: Number(id) },
        data: {
          archivedAt: new Date(),
        },
      });
    }

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
    ctx.status = 402;
    ctx.body = {
      message: "This ticket is already exist in database",
    };
    return;
  }

  const {
    account,
    ticket,
    tp,
    sl,
    pair,
    lot,
    openPrice,
    closePrice,
    reason,
    difference,
    compensateInUsd,
  } = ctx.request.body;

  try {
    const savedResult = await prisma.result.create({
      data: {
        account,
        ticket,
        pair,
        lot: parseFloat(lot),
        openPrice: parseFloat(openPrice),
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

async function generateReport(filter: string | string[]) {}

// router.get("/report", async (ctx) => {
//   const { filter } = ctx.query;
//   const report = await generateReport(filter);
//   ctx.body = report;
// });
// Use routes
app.use(cors());
app.use(router.routes());
app.use(routes);
app.use(router.allowedMethods());

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
