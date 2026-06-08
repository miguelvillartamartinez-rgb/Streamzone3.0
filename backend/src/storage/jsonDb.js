const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');

const DEFAULT_DATA = {
  users: [
    {
      id: 1,
      username: 'admin',
      email: 'admin@streamzone.com',
      password: 'admin123',
      created_at: '2026-01-01T00:00:00.000Z',
    },
  ],
  movies: [
    {
      id: 1,
      tmdb_id: 11,
      title: 'Star Wars: Episodio IV - Una Nueva Esperanza',
      overview:
        'La Princesa Leia es capturada y retenida como rehén por las fuerzas imperiales.',
      poster_path: '/2l05cFWJacyqGzSnHRDBok20i10.jpg',
      release_date: '1977-05-25',
      created_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 2,
      tmdb_id: 27205,
      title: 'Inception',
      overview:
        'Un ladrón que roba secretos corporativos a través del uso de la tecnología de compartir sueños.',
      poster_path: '/9gk7adHYeDvHkCSEqAvQNLF5jku.jpg',
      release_date: '2010-07-16',
      created_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 3,
      tmdb_id: 155,
      title: 'The Dark Knight',
      overview: 'Batman se enfrenta al Joker, un criminal que desata el caos en Gotham.',
      poster_path: '/qJ2tWRXcWCMQ8EMKdsm7vZZ8Qob.jpg',
      release_date: '2008-07-18',
      created_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 4,
      tmdb_id: 157336,
      title: 'Interstellar',
      overview: 'Un grupo de exploradores viaja a través de un agujero de gusano en el espacio.',
      poster_path: '/gEU2QniE6E77NI6lCU6M0nbVZv9.jpg',
      release_date: '2014-11-07',
      created_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 5,
      tmdb_id: 185,
      title: 'Transformers',
      overview: 'La guerra entre Autobots y Decepticons llega a la Tierra.',
      poster_path: '/fAyRbQs7bkvqSsWiYm1vHzXoTdA.jpg',
      release_date: '2007-07-03',
      created_at: '2026-01-01T00:00:00.000Z',
    },
  ],
  favorites: [
    { id: 1, user_id: 1, movie_id: 1, created_at: '2026-01-01T00:00:00.000Z' },
    { id: 2, user_id: 1, movie_id: 2, created_at: '2026-01-01T00:00:00.000Z' },
    { id: 3, user_id: 1, movie_id: 3, created_at: '2026-01-01T00:00:00.000Z' },
  ],
  watch_later: [
    { id: 1, user_id: 1, movie_id: 4, created_at: '2026-01-01T00:00:00.000Z' },
    { id: 2, user_id: 1, movie_id: 5, created_at: '2026-01-01T00:00:00.000Z' },
  ],
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readCollection(name) {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, `${name}.json`);

  if (!fs.existsSync(filePath)) {
    const initialData = DEFAULT_DATA[name] ?? [];
    fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2), 'utf-8');
    return structuredClone(initialData);
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeCollection(name, data) {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, `${name}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function nextId(items) {
  if (!items.length) {
    return 1;
  }
  return Math.max(...items.map((item) => item.id)) + 1;
}

function nowIso() {
  return new Date().toISOString();
}

module.exports = {
  readCollection,
  writeCollection,
  nextId,
  nowIso,
};
