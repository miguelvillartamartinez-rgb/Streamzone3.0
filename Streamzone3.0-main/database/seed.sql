-- StreamZone - Datos de prueba (Fase 2)
-- Ejecutar después de schema.sql

-- Usuario de prueba (mismas credenciales que el frontend en localStorage)
-- Email: admin@gmail.com | Contraseña: admin123
-- Nota: texto plano solo para desarrollo; en fases posteriores se guardará un hash.
INSERT INTO users (username, email, password)
VALUES ('admin', 'admin@gmail.com', 'admin123');

-- Películas de ejemplo (IDs de TMDB reales)
INSERT INTO movies (tmdb_id, title, overview, poster_path, release_date) VALUES
(
  11,
  'Star Wars: Episodio IV - Una Nueva Esperanza',
  'La Princesa Leia es capturada y retenida como rehén por las fuerzas imperiales.',
  '/2l05cFWJacyqGzSnHRDBok20i10.jpg',
  '1977-05-25'
),
(
  27205,
  'Inception',
  'Un ladrón que roba secretos corporativos a través del uso de la tecnología de compartir sueños.',
  '/9gk7adHYeDvHkCSEqAvQNLF5jku.jpg',
  '2010-07-16'
),
(
  155,
  'The Dark Knight',
  'Batman se enfrenta al Joker, un criminal que desata el caos en Gotham.',
  '/qJ2tWRXcWCMQ8EMKdsm7vZZ8Qob.jpg',
  '2008-07-18'
),
(
  157336,
  'Interstellar',
  'Un grupo de exploradores viaja a través de un agujero de gusano en el espacio.',
  '/gEU2QniE6E77NI6lCU6M0nbVZv9.jpg',
  '2014-11-07'
),
(
  185,
  'Transformers',
  'La guerra entre Autobots y Decepticons llega a la Tierra.',
  '/fAyRbQs7bkvqSsWiYm1vHzXoTdA.jpg',
  '2007-07-03'
);

-- Favoritos del usuario admin (películas con id 1, 2 y 3)
INSERT INTO favorites (user_id, movie_id) VALUES
(1, 1),
(1, 2),
(1, 3);

-- Ver más tarde del usuario admin (películas con id 4 y 5)
INSERT INTO watch_later (user_id, movie_id) VALUES
(1, 4),
(1, 5);
