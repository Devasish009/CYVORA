-- ============================================================
--  TravelBharat Database Schema
-- ============================================================

DROP TABLE IF EXISTS "session" CASCADE;
DROP TABLE IF EXISTS gallery_images CASCADE;
DROP TABLE IF EXISTS destinations CASCADE;
DROP TABLE IF EXISTS states CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  full_name     VARCHAR(150) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  username      VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20) DEFAULT 'user',
  created_at    TIMESTAMP DEFAULT NOW()
);

-- States & Union Territories
CREATE TABLE IF NOT EXISTS states (
  id                 SERIAL PRIMARY KEY,
  name               VARCHAR(150) NOT NULL,
  type               VARCHAR(30) NOT NULL CHECK (type IN ('state','union_territory')),
  capital            VARCHAR(150),
  region             VARCHAR(50),
  description        TEXT,
  image_url          TEXT,
  best_time          VARCHAR(100),
  language           VARCHAR(150),
  famous_for         TEXT,
  destinations_count INTEGER DEFAULT 0
);

-- Destinations
CREATE TABLE IF NOT EXISTS destinations (
  id          SERIAL PRIMARY KEY,
  state_id    INTEGER REFERENCES states(id) ON DELETE CASCADE,
  name        VARCHAR(200) NOT NULL,
  location    VARCHAR(200),
  category    VARCHAR(50) CHECK (category IN ('Heritage','Nature','Adventure','Religious','Beach','Wildlife')),
  description TEXT,
  image_url   TEXT,
  entry_fee   VARCHAR(100),
  best_time   VARCHAR(100),
  rating      NUMERIC(2,1) DEFAULT 4.0
);

-- Gallery Images
CREATE TABLE IF NOT EXISTS gallery_images (
  id         SERIAL PRIMARY KEY,
  title      VARCHAR(200) NOT NULL,
  location   VARCHAR(200),
  state      VARCHAR(150),
  image_url  TEXT NOT NULL,
  category   VARCHAR(50)
);

-- Sessions (for express-session with connect-pg-simple)
CREATE TABLE IF NOT EXISTS "session" (
  "sid"    VARCHAR NOT NULL COLLATE "default",
  "sess"   JSON NOT NULL,
  "expire" TIMESTAMP(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
