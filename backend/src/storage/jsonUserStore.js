const { readCollection, writeCollection, nextId, nowIso } = require('./jsonDb');

async function findById(id) {
  const users = readCollection('users');
  const user = users.find((item) => item.id === id);
  if (!user) {
    return null;
  }

  const { password, ...publicUser } = user;
  return publicUser;
}

async function findByEmail(email) {
  const users = readCollection('users');
  return users.find((item) => item.email.toLowerCase() === email.toLowerCase()) || null;
}

async function createUser({ username, email, password }) {
  const users = readCollection('users');
  const normalizedEmail = email.toLowerCase();

  if (users.some((item) => item.email.toLowerCase() === normalizedEmail)) {
    const error = new Error('El email ya está registrado');
    error.code = '23505';
    throw error;
  }

  if (users.some((item) => item.username.toLowerCase() === username.toLowerCase())) {
    const error = new Error('El username ya está en uso');
    error.code = '23505';
    throw error;
  }

  const user = {
    id: nextId(users),
    username,
    email: normalizedEmail,
    password,
    created_at: nowIso(),
  };

  users.push(user);
  writeCollection('users', users);

  const { password: _, ...publicUser } = user;
  return publicUser;
}

module.exports = {
  findById,
  findByEmail,
  createUser,
};
