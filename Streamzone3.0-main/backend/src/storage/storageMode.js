const { testConnection } = require('../db');

let mode = null;

async function getStorageMode() {
  if (mode) {
    return mode;
  }

  if (process.env.STORAGE_MODE === 'json') {
    mode = 'json';
    return mode;
  }

  if (process.env.STORAGE_MODE === 'postgres') {
    mode = 'postgres';
    return mode;
  }

  try {
    await testConnection();
    mode = 'postgres';
  } catch {
    mode = 'json';
    console.warn(
      '[StreamZone] PostgreSQL no disponible. Usando almacenamiento JSON en backend/data/'
    );
  }

  return mode;
}

function getStorageModeSync() {
  return mode;
}

function setStorageModeForTests(nextMode) {
  mode = nextMode;
}

module.exports = {
  getStorageMode,
  getStorageModeSync,
  setStorageModeForTests,
};
