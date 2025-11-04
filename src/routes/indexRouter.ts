import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import passport from "../auth/passport.js";
import * as controller from "../controllers/indexController.js"
const indexRouter = Router();

indexRouter.post("/login", (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("local", (err: Error | null, user: Express.User, info: { message?: string } | undefined) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info?.message || "Invalid credentials" });

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.status(200).json({ message: "Login successful", user });
    });
  })(req, res, next);
});

indexRouter.post("/logout", controller.logoutPost);

export default indexRouter;
