import Koa from "koa";
import Router from "@koa/router";
import passport from "koa-passport";
import jwt from "jsonwebtoken";
import { User as PrismaUser } from "@prisma/client";
import { prisma } from "../database";
import * as process from "process";

const router = new Router();

router.post("/login", async (ctx: Koa.Context, next: Koa.Next) => {
  return passport.authenticate(
    "local",
    async (err: Error, user: PrismaUser, info: Object, status: number) => {
      if (err) {
        ctx.status = 500;
        ctx.body = { message: err.message };
        return;
      }
      if (!user) {
        ctx.status = 400;
        ctx.body = { message: "Email or password is wrong" };
        return;
      }

      // Fetch user with roles and permissions
      const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      if (fullUser == null) {
        ctx.status = 404;
        ctx.body = { message: "User not found." };
        return;
      }

      const payload = {
        id: user.id,
        email: user.email,
      };
      const secret = process.env.JWT_SECRET;
      const token = jwt.sign(payload, secret!, { expiresIn: "30d" });
      const { id, email } = user;
      ctx.body = { user: { id, email }, token };
    },
  )(ctx, next);
});

export default router;
