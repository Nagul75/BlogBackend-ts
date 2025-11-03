import { Author as PrismaAuthor } from "../generated/prisma/client.ts";

declare global {
  namespace Express {
    export interface User extends PrismaAuthor { }
  }
}
