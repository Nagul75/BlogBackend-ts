# Blog Platform — Backend  
**REST API for a Production-Style Blogging System**

This repository contains the backend service for a full-stack blog platform. It exposes a secure, role-aware REST API for managing users, posts, comments, and votes, with a strong emphasis on authentication, authorization, and data integrity.

The backend is designed to resemble real production services rather than a simple CRUD demo.

---

## Overview

The Blog Platform backend provides:
- Secure user authentication and session management
- Role-based access control (admin vs regular users)
- Post creation, publishing, and moderation
- Commenting and voting with permission enforcement
- Clean, modular REST API design

---

## Tech Stack

- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma ORM
- Passport.js (authentication)
- REST APIs

---

## Core Features

### Authentication & Authorization

- User registration and login
- Session-based authentication using Passport.js
- Role-based authorization:
  - **Admin**: create, edit, publish, and delete posts
  - **Users**: read posts, comment, and vote
- Middleware-driven access control to protect routes

---

### Posts

- Create, update, publish, and delete blog posts (admin-only)
- Draft vs published state handling
- Public read access to published posts
- Clean separation between controller and routing logic

---

### Comments

- Authenticated users can create comments on posts
- Comment ownership enforced at the API level
- Admin moderation support (delete/edit)

---

### Voting System

- Upvote and downvote functionality for posts and comments
- Vote tracking with integrity constraints
- Prevention of duplicate or invalid votes

---

## API Design

- RESTful route structure
- Predictable HTTP status codes
- JSON request/response format
- Centralized error handling
- Middleware-based request validation and authorization

Routes:

```text
POST   /login
POST   /logout

GET    /posts
GET    /posts/:slug
GET    /posts/:slug/comments

POST   /admin/posts
POST   /posts/:slug/comments

DEL    /admin/posts/:slug
DEL    /posts/:slug/comments/:commentid

PUT    /admin/posts/:slug
PUT    /posts/:slug/comments/:commentid

POST   /posts/:id/comments
POST   /posts/:id/vote
