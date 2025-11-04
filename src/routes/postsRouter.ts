import { Router } from "express";
import * as controller from "../controllers/postsController.js";
const postsRouter = Router();
import { Request, Response, NextFunction } from "express";

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: "Not authorized" });
  }
  next();
}

// Read
postsRouter.get("/posts", controller.getAllPosts);
postsRouter.get("/posts/:slug", controller.getPostBySlug);
postsRouter.get("/posts/:slug/comments", controller.getAllComments);

// Create
postsRouter.post("/admin/posts", isAuthenticated, controller.createPost);
postsRouter.post("/posts/:slug/comments", controller.createComment);

// Delete 
postsRouter.delete("/admin/posts/:slug", isAuthenticated, controller.deletePostBySlug);
postsRouter.delete("/posts/:slug/comments/:commentid", controller.deleteCommentByID);

//update
postsRouter.put("/admin/posts/:slug", isAuthenticated, controller.updatePostBySlug);

export default postsRouter;
