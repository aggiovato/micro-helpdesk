import type { ExpressContextFunctionArgument } from "@as-integrations/express5";
import { GraphQLError } from "graphql";
import { jwtVerify } from "jose";

import { pool } from "../db/pool.js";

export type AuthRole = "ADMIN" | "AGENT" | "CLIENT";

export type AuthUser = {
  id: string;
  role: AuthRole;
};

export type GraphQLContext = {
  db: typeof pool;
  requestId: string;
  user: AuthUser | null;
};

function getBearerToken(authHeader?: string): string | null {
  if (!authHeader) return null;
  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}

async function verifyToken(token: string): Promise<AuthUser> {
  // HS256 secret for local/dev
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  const { payload } = await jwtVerify(token, secret);

  const id = typeof payload.sub === "string" ? payload.sub : null;
  const role = typeof payload.role === "string" ? payload.role : null;

  if (!id || (role !== "ADMIN" && role !== "AGENT" && role !== "CLIENT")) {
    throw new GraphQLError("Invalid token payload", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  return { id, role };
}

export async function buildContext({
  req,
}: ExpressContextFunctionArgument): Promise<GraphQLContext> {
  const requestId = (req.headers["x-request-id"] as string) ?? globalThis.crypto.randomUUID();

  const token = getBearerToken(req.headers.authorization);

  // Public requests are allowed; user stays null unless a valid token is provided.
  let user: AuthUser | null = null;

  if (token) {
    try {
      user = await verifyToken(token);
    } catch {
      // If the client sent a token and it's invalid, fail fast.
      throw new GraphQLError("Unauthenticated", {
        extensions: { code: "UNAUTHENTICATED", requestId },
      });
    }
  }

  return { db: pool, requestId, user };
}
