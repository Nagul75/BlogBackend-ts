import { Request, Response, NextFunction } from "express";

async function logoutPost(req: Request, res: Response, next: NextFunction) {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
}

export { logoutPost };
