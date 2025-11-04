import { Request, Response, NextFunction } from "express"
import { PrismaClient } from "../generated/prisma/client.js";
import * as slugify from "slugify";
import type { createCommentBody, createPostBody, updatePostBody } from "../types/reqBodyTypes.js";
const prisma = new PrismaClient();
const realSlugify = (slugify as any).default || slugify;

// Read operations
async function getAllPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const posts = await prisma.post.findMany();
    res.json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching posts" });
  }
}

async function getPostBySlug(req: Request<{ slug: string }>, res: Response, next: NextFunction) {
  try {
    const slug = req.params.slug;
    const post = await prisma.post.findUnique({
      where: {
        slug
      }
    });
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    res.json(post);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching post" });
  }
}

async function getAllComments(req: Request<{ slug: string }>, res: Response, next: NextFunction) {
  try {
    const slug = req.params.slug;

    const post = await prisma.post.findUnique({
      where: {
        slug
      }
    });

    if (!post) return res.status(404).json({ error: "Post not found." });

    const comments = await prisma.comment.findMany({
      where: {
        postId: post.id
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(comments);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching comments" });
  }
}

// Create operations 
async function createPost(req: Request<{}, unknown, createPostBody>, res: Response, next: NextFunction) {
  try {
    const { title, content, publish } = req.body;
    const authorID = req.user ? req.user.id : null;

    if (!authorID) {
      res.status(400).json({ "error": "invalid author" });
      return;
    }

    const slug = realSlugify(title, { lower: true, strict: true });

    const existing = await prisma.post.findUnique({
      where: { slug }
    });

    if (existing) return res.status(400).json({ "error": "A post with this title already exists!" });

    const post = await prisma.post.create({
      data: {
        title,
        content,
        slug,
        status: publish ? "PUBLISHED" : "DRAFT",
        publishedAt: publish ? new Date() : null,
        Author: { connect: { id: authorID } }
      }
    });

    return res.status(201).json(post);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create post!" });
  }
}


async function createComment(req: Request<{ slug: string }, unknown, createCommentBody>, res: Response, next: NextFunction) {
  try {
    const slug = req.params.slug;
    const { content, authorName } = req.body;

    // Find post 
    const post = await prisma.post.findUnique({
      where: {
        slug,
      }
    });

    if (!post) return res.status(404).json({ error: "Post not found!" });

    // if an user is logged in (admin)
    if (req.user) {
      const comment = await prisma.comment.create({
        data: {
          content,
          authorName: req.user.name ?? "Author",
          Post: { connect: { id: post.id } },
          Author: { connect: { id: req.user.id } }
        }
      });
      return res.status(201).json(comment);
    }

    // anonymous comment 
    if (!authorName) {
      return res.status(400).json({ error: "Anonymous comments must include author name." });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorName,
        Post: { connect: { id: post.id } }
      }
    });

    return res.status(201).json(comment);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error posting comment!" });
  }
}


// Delete operations 
async function deletePostBySlug(req: Request<{ slug: string }>, res: Response, next: NextFunction) {
  try {
    const slug = req.params.slug;

    const post = await prisma.post.findUnique({
      where: {
        slug,
      }
    });

    if (!post) return res.status(404).json({ error: "Post not found." });

    await prisma.$transaction([
      prisma.comment.deleteMany({ where: { postId: post.id } }),
      prisma.post.delete({ where: { id: post.id } })
    ]);

    res.status(200).json({ success: "Post deleted successfully!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to delete post." });
  }
}

async function deleteCommentByID(req: Request<{ slug: string, commentid: string }>, res: Response, next: NextFunction) {
  try {
    const slug = req.params.slug;
    const commentid = req.params.commentid;

    const comment = await prisma.comment.findUnique({
      where: {
        id: commentid
      }
    });

    if (!comment) return res.status(404).json({ error: "Comment not found." });

    await prisma.comment.delete({
      where: {
        id: comment.id,
      }
    });
    res.status(200).json({ success: "Comment deleted successfully!" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Failed to delete comment" });
  }
}

// Update operations 
async function updatePostBySlug(req: Request<{ slug: string }, unknown, updatePostBody>, res: Response, next: NextFunction) {
  try {
    const slug = req.params.slug;
    const { title, content, publish } = req.body;

    const existingPost = await prisma.post.findUnique({
      where: {
        slug,
      }
    });

    if (!existingPost) return res.status(404).json({ error: "Post not found." });

    // if title has changed, regenerate slug 
    let newSlug = existingPost.slug;
    if (title && title !== existingPost.title) {
      newSlug = realSlugify(title, { lower: true, strict: true });

      // check for duplicate slug 
      const dupe = await prisma.post.findUnique({ where: { slug: newSlug } });
      if (dupe && dupe.id !== existingPost.id) {
        return res.status(400).json({ error: "Another post with same title exists." });
      }
    }

    const updatedPost = await prisma.post.update({
      where: { slug },
      data: {
        title: title ?? existingPost.title,
        content: content ?? existingPost.content,
        slug: newSlug,
        status: publish !== undefined ? publish ? "PUBLISHED" : "DRAFT" : existingPost.status, // if updating publish, else existing
        publishedAt: publish !== undefined ? publish ? new Date() : null : existingPost.publishedAt,
      }
    });

    return res.status(200).json(updatedPost);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Failed to update post." });
  }
}

export {
  getAllPosts, getAllComments, getPostBySlug, createPost,
  createComment, deletePostBySlug, deleteCommentByID, updatePostBySlug,
}
