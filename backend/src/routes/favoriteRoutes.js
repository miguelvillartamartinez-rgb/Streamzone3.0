const express = require('express');
const favoriteController = require('../controllers/favoriteController');

const router = express.Router();

router.get('/:userId', favoriteController.getFavoritesByUserId);
router.post('/', favoriteController.addFavorite);
router.delete('/:id', favoriteController.deleteFavorite);

module.exports = router;
