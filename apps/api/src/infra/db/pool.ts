import pg from "pg";

const { Pool } = pg;

/**
 * Create a connection pool
 */
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function dbPing(): Promise<boolean> {
  const res = await pool.query("SELECT 1 AS ok");
  return res.rows?.[0]?.ok === 1;
}
