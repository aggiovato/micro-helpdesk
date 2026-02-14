import type pg from "pg";
import { listUsers, type UserDTO } from "../../data/repositories/user.repo.js";
import type { AuthUser } from "../../infra/graphql/context.js";
import { GraphQLError } from "graphql/error/index.js";

/**
 * Retrieves a list of users from the database, with an optional limit on the number of users returned.
 * Note: This function does not implement any authentication or authorization checks, so it should be used with caution.
 *
 * @param db Database connection pool
 * @param opts Optional options object with a limit property
 * @returns A list of users, with each user object containing the user's id, email, role, and createdAt timestamp
 */
export async function getUsers(
  db: pg.Pool,
  user: AuthUser | null,
  opts?: { limit?: number },
): Promise<UserDTO[]> {
  if (!user) {
    throw new GraphQLError("Unauthenticated", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  if (user.role !== "ADMIN") {
    throw new GraphQLError("Forbidden", {
      extensions: { code: "FORBIDDEN" },
    });
  }

  const limit = opts?.limit ?? 50;
  return listUsers(db, limit);
}
