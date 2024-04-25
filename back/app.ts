import Koa from "koa";
import cors from "@koa/cors";
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
require("./src/auth/passport");
app.use(passport.initialize());

app.use(cors());
app.use(routes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
