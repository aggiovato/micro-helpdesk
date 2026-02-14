import type pg from "pg";
import { GraphQLError } from "graphql";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

import { createUser, findUserAuthByEmail } from "../../data/repositories/user.repo.js";

type RegisterInput = { email: string; password: string; role?: string };
type LoginInput = { email: string; password: string };

/**
 * Signs a JWT token with the user id as subject and role in the payload, valid for 2 hours.
 * The secret is read from the environment variable JWT_SECRET.
 * In production, use a strong secret and consider a rotation strategy.
 *
 * @param user object containing the user id and role to be signed in the token
 * @returns a signed JWT token with the user id as subject and role in the payload, valid for 2 hours
 * @throws if signing fails (e.g. invalid secret)
 */
async function signToken(user: { id: string; role: string }): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  return new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret);
}

/**
 * Registers a new user with email and password. If successful, returns a JWT token and the user info (without password).
 * If the credentials are invalid, throws an error.
 *
 * @param db Database connection pool
 * @param input object waiting for an email and a password to be created
 * @returns a token and the user info if the credentials are correct, otherwise throws an error
 */
export async function register(db: pg.Pool, input: RegisterInput) {
  const email = input.email.trim().toLowerCase();
  const role = (input.role ?? "CLIENT").toUpperCase();

  if (!email.includes("@")) {
    throw new GraphQLError("Invalid email", { extensions: { code: "BAD_USER_INPUT" } });
  }
  if (input.password.length < 8) {
    throw new GraphQLError("Password must be at least 8 characters", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  const existing = await findUserAuthByEmail(db, email);
  if (existing) {
    throw new GraphQLError("Email already in use", { extensions: { code: "CONFLICT" } });
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await createUser(db, {
    email,
    passwordHash,
    role,
  });

  const token = await signToken({ id: user.id, role: user.role });

  return { token, user };
}

/**
 * Login a user with email and password. If successful, returns a JWT token and the user info (without password).
 * If the credentials are invalid, throws an error.
 *
 * @param db Database connection pool
 * @param input object waiting for an email and a password to be verified
 * @returns a token and the user info if the credentials are correct, otherwise throws an error
 */
export async function login(db: pg.Pool, input: LoginInput) {
  const email = input.email.trim().toLowerCase();

  const user = await findUserAuthByEmail(db, email);
  if (!user) {
    throw new GraphQLError(`Invalid credentials: email '${email}' not found`, {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    throw new GraphQLError("Invalid credentials: password does not match", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const token = await signToken({ id: user.id, role: user.role });

  const { passwordHash, ...safeUser } = user;
  return { token, user: safeUser };
}
