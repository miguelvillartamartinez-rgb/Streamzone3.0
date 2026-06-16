-- StreamZone - Esquema de base de datos (Fase 2)
-- Ejecutar sobre una base de datos vacía llamada "streamzone"

-- Tabla de usuarios
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de películas (catálogo persistido desde TMDB, alta manual u otras fuentes)
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

CREATE UNIQUE INDEX uq_movies_tmdb_id ON movies (tmdb_id) WHERE tmdb_id IS NOT NULL;

-- Favoritos de cada usuario
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

-- Lista "Ver más tarde" de cada usuario
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
