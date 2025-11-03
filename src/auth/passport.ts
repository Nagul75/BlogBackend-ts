import passport from "passport"
import { Strategy } from "passport-local"
import bcrypt from "bcryptjs"
import "dotenv/config"
import { PrismaClient } from "../generated/prisma/client.js"

const LocalStrategy = Strategy
const prisma = new PrismaClient();

passport.use(new LocalStrategy(
  { usernameField: "email" },
  async (email, password, done) => {
    try {
      const author = await prisma.author.findUnique({
        where: {
          email: email
        }
      });
      if (!author) {
        return done(null, false, { message: "Incorrect email" });
      }
      const isValid = await bcrypt.compare(password, author.password)
      if (!isValid) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, author);
    } catch (err) {
      return done(err);
    }
  }))

passport.serializeUser((user, done) => {
  done(null, user.id);
})

passport.deserializeUser(async (id: string | undefined, done) => {
  if (!id) {
    done("No ID in session", null);
  }

  try {
    const author = await prisma.author.findUnique({
      where: {
        id: id,
      }
    });
    if (author) {
      done(null, author);
    } else {
      done("User not found", null);
    }
  } catch (err) {
    done(err);
  }
})

export default passport;
