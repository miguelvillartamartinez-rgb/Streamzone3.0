-- StreamZone — Migración 001: ampliar tabla movies para alta manual y reproducción
-- Ejecutar sobre una base de datos streamzone ya creada con schema.sql original:
--   psql -U postgres -d streamzone -f database/migrations/001_extend_movies.sql

ALTER TABLE movies
  ADD COLUMN IF NOT EXISTS genre VARCHAR(100),
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS video_url VARCHAR(512),
  ADD COLUMN IF NOT EXISTS source VARCHAR(20) NOT NULL DEFAULT 'tmdb';

ALTER TABLE movies
  ALTER COLUMN tmdb_id DROP NOT NULL;

ALTER TABLE movies DROP CONSTRAINT IF EXISTS movies_tmdb_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS uq_movies_tmdb_id
  ON movies (tmdb_id)
  WHERE tmdb_id IS NOT NULL;

ALTER TABLE movies DROP CONSTRAINT IF EXISTS chk_movies_source;

ALTER TABLE movies
  ADD CONSTRAINT chk_movies_source
  CHECK (source IN ('tmdb', 'manual', 'local'));
