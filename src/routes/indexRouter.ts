import { Router } from "express";
import passport from "../auth/passport.js";
import * as controller from "../controllers/indexController.js"
const indexRouter = Router();

indexRouter.post("/login", passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/",
})
);

indexRouter.post("/logout", controller.logoutPost);

export default indexRouter;
