-- StreamZone - Esquema relacional PostgreSQL (Fase 2)
-- Ejecutar sobre una base de datos vacía llamada "streamzone"
--
-- Modelo de datos:
--   users        → cuentas de la plataforma
--   movies       → catálogo persistido (TMDB, alta manual o assets locales)
--   favorites    → relación N:M usuario ↔ película (marcadas como favoritas)
--   watch_later  → relación N:M usuario ↔ película (lista "Ver más tarde")

-- ---------------------------------------------------------------------------
-- USERS: autenticación y perfil básico
-- PK: id (SERIAL). username y email únicos para evitar duplicados en registro.
-- ---------------------------------------------------------------------------
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- MOVIES: catálogo central del TFG
-- PK: id (SERIAL interno de StreamZone).
-- tmdb_id: identificador externo de The Movie Database; NULL en altas manuales.
-- source: origen del registro → 'tmdb' | 'manual' | 'local'
--   - tmdb   : película sincronizada desde la API externa (favoritos/ver más tarde)
--   - manual : alta hecha por el administrador (video_url, genre, etc.)
--   - local  : reservado para catálogo embebido en assets del frontend
-- genre, duration_minutes, video_url: campos añadidos para reproducción manual.
-- poster_path: ruta TMDB relativa o URL absoluta (http/https) en manuales.
-- ---------------------------------------------------------------------------
CREATE TABLE movies (
  id SERIAL PRIMARY KEY,
  tmdb_id INTEGER,
  title VARCHAR(150) NOT NULL,
  overview TEXT,
  poster_path VARCHAR(255),
  release_date DATE,
  genre VARCHAR(100),
  duration_minutes INTEGER,
  video_url VARCHAR(512),
  source VARCHAR(20) NOT NULL DEFAULT 'tmdb',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_movies_source CHECK (source IN ('tmdb', 'manual', 'local'))
);

-- Índice único parcial: solo exige unicidad de tmdb_id cuando existe.
-- Permite múltiples filas con tmdb_id NULL (películas manuales).
CREATE UNIQUE INDEX uq_movies_tmdb_id ON movies (tmdb_id) WHERE tmdb_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- FAVORITES: tabla puente usuario ↔ película
-- FK user_id → users(id) ON DELETE CASCADE: al borrar usuario, se borran sus favoritos.
-- FK movie_id → movies(id) ON DELETE CASCADE: al borrar película, desaparece de favoritos.
-- UNIQUE (user_id, movie_id): un usuario no puede duplicar la misma película.
-- ---------------------------------------------------------------------------
CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  movie_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_favorites_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_favorites_movie
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  CONSTRAINT uq_favorites_user_movie UNIQUE (user_id, movie_id)
);

-- ---------------------------------------------------------------------------
-- WATCH_LATER: misma estructura que favorites, lista "Ver más tarde"
-- ON DELETE CASCADE mantiene integridad referencial igual que en favorites.
-- ---------------------------------------------------------------------------
CREATE TABLE watch_later (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  movie_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_watch_later_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_watch_later_movie
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  CONSTRAINT uq_watch_later_user_movie UNIQUE (user_id, movie_id)
);
