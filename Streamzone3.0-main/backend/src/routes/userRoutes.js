/**
 * Rutas de autenticación — montadas en /api/users
 */
const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/register', userController.register);
router.post('/login', userController.login);

module.exports = router;
