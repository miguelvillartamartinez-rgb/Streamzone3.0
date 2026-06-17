-- StreamZone — Migración 001: ampliar tabla movies para alta manual y reproducción
--
-- Problema que resuelve:
--   El schema original solo contemplaba películas TMDB (tmdb_id obligatorio y único).
--   Para el TFG se necesita que el administrador dé de alta películas propias con
--   vídeo, género y duración, sin depender de un identificador TMDB.
--
-- Ejecutar sobre una BD streamzone ya creada con schema.sql original:
--   psql -U postgres -d streamzone -f database/migrations/001_extend_movies.sql

-- Campos nuevos para catálogo manual y pantalla de reproducción
ALTER TABLE movies
  ADD COLUMN IF NOT EXISTS genre VARCHAR(100),
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS video_url VARCHAR(512),
  ADD COLUMN IF NOT EXISTS source VARCHAR(20) NOT NULL DEFAULT 'tmdb';

-- tmdb_id pasa a NULL: las películas manuales no tienen id en TMDB
ALTER TABLE movies
  ALTER COLUMN tmdb_id DROP NOT NULL;

-- Se elimina la UNIQUE global sobre tmdb_id (no permite varios NULL en versiones antiguas)
ALTER TABLE movies DROP CONSTRAINT IF EXISTS movies_tmdb_id_key;

-- Índice único parcial: unicidad solo cuando tmdb_id IS NOT NULL.
-- Así pueden coexistir muchas películas manuales (tmdb_id NULL) sin conflicto.
CREATE UNIQUE INDEX IF NOT EXISTS uq_movies_tmdb_id
  ON movies (tmdb_id)
  WHERE tmdb_id IS NOT NULL;

-- Restricción de dominio para el origen del registro en catálogo
ALTER TABLE movies DROP CONSTRAINT IF EXISTS chk_movies_source;

ALTER TABLE movies
  ADD CONSTRAINT chk_movies_source
  CHECK (source IN ('tmdb', 'manual', 'local'));
