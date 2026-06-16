const userModel = require('../models/userModel');
const { isGmailEmail } = require('../utils/emailValidation');

function isEmpty(value) {
  return typeof value !== 'string' || value.trim() === '';
}

function toPublicUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    created_at: user.created_at,
  };
}

async function register(req, res) {
  const { username, email, password } = req.body;

  if (isEmpty(username) || isEmpty(email) || isEmpty(password)) {
    return res.status(400).json({
      success: false,
      message: 'username, email y password son obligatorios',
    });
  }

  if (!isGmailEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Debes usar una cuenta de Gmail (por ejemplo: tu@gmail.com)',
    });
  }

  try {
    const existingUser = await userModel.findByEmail(email.trim());
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'El email ya está registrado',
      });
    }

    // Mejora futura: hashear la contraseña con bcrypt antes de guardarla
    const user = await userModel.createUser({
      username: username.trim(),
      email: email.trim(),
      password,
    });

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      user: toPublicUser(user),
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'El username o el email ya están en uso',
      });
    }

    console.error('Error en register:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  if (isEmpty(email) || isEmpty(password)) {
    return res.status(400).json({
      success: false,
      message: 'email y password son obligatorios',
    });
  }

  if (!isGmailEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Debes usar una cuenta de Gmail (por ejemplo: tu@gmail.com)',
    });
  }

  try {
    const user = await userModel.findByEmail(email.trim());

    // Comparación en texto plano solo para desarrollo (ver README)
    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos',
      });
    }

    return res.json({
      success: true,
      message: 'Inicio de sesión correcto',
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
}

module.exports = {
  register,
  login,
};
