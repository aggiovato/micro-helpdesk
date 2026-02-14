import type pg from "pg";

export type UserDTO = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
};

export type UserAuthRow = UserDTO & {
  passwordHash: string;
};

/**
 * Retrieves a list of users from the database, with an optional limit on the number of users returned.
 * Note: This function does not implement any authentication or authorization checks, so it should be used with caution.
 *
 * @param db Database connection pool
 * @param limit Optional limit on the number of users returned
 * @returns A list of users, with each user object containing the user's id, email, role, and createdAt timestamp
 */
export async function listUsers(db: pg.Pool, limit = 50): Promise<UserDTO[]> {
  const { rows } = await db.query<UserDTO>(
    /* SQL */ `
    SELECT
      id,
      email,
      role,
      created_at AS "createdAt"
    FROM users
    ORDER BY created_at DESC
    LIMIT $1
    `,
    [limit],
  );

  return rows;
}

/**
 * Retrieves a user from the database by email, with an optional limit on the number of users returned.
 * Note: This function does not implement any authentication or authorization checks, so it should be used with caution.
 *
 * @param db Database connection pool
 * @param email The email of the user to be retrieved
 * @returns A user object containing the user's id, email, role, and createdAt timestamp
 */
export async function findUserAuthByEmail(db: pg.Pool, email: string): Promise<UserAuthRow | null> {
  const { rows } = await db.query<UserAuthRow>(
    /* SQL */ `
    SELECT
      id,
      email,
      role,
      password_hash AS "passwordHash",
      created_at AS "createdAt"
    FROM users
    WHERE email = $1
    LIMIT 1
    `,
    [email],
  );

  return rows[0] ?? null;
}

/**
 * Creates a new user in the database.
 * Note: This function does not implement any authentication or authorization checks, so it should be used with caution.
 *
 * @param db Database connection pool
 * @param input An object containing the user's email, passwordHash, and role
 * @returns A user object containing the user's id, email, role, and createdAt timestamp
 */
export async function createUser(
  db: pg.Pool,
  input: { email: string; passwordHash: string; role: string },
): Promise<UserDTO> {
  const { rows } = await db.query<UserDTO>(
    /* SQL */ `
    INSERT INTO users (email, password_hash, role)
    VALUES ($1, $2, $3)
    RETURNING
      id,
      email,
      role,
      created_at AS "createdAt"
    `,
    [input.email, input.passwordHash, input.role],
  );

  return rows[0]!;
}
