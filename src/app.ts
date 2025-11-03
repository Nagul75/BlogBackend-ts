import "dotenv/config"
import express, { Request, Response } from "express";
import session from "express-session";
import passport from "passport";
import indexRouter from "./routes/indexRouter.js";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";

import "./auth/passport.js"
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET as string,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7
  },
  store: new PrismaSessionStore(prisma, {
    checkPeriod: 10 * 60 * 1000,
  })
}));
app.use(passport.session());

app.use(express.urlencoded({ extended: false }));

app.use("/", indexRouter);

app.listen(3000, () => {
  console.log("Server running on 3000 ...");
})


