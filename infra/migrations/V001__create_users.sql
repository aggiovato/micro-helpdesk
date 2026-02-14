-- Enable UUID generation (required for gen_random_uuid()).
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Core users table (auth + roles).
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'AGENT', 'CLIENT')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
