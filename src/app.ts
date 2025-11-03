import express, { Request, Response } from "express";
import session from "express-session";
import passport from "passport";
import indexRouter from "./routes/indexRouter.js";

const app = express();

app.use(express.json());

app.use(session({
  secret: "cats",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.session());

app.use(express.urlencoded({ extended: false }));

app.use("/", indexRouter);

app.use("/profile", (req, res, next) => {
  if (!req.isAuthenticated()) {
    res.json({ "Message": "Not authorised!" })
  }
  res.json(req.user);
})

app.listen(3000, () => {
  console.log("Server running on 3000 ...");
})


