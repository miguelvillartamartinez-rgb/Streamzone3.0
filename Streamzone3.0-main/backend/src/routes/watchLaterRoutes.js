/**
 * Rutas "Ver más tarde" — montadas en /api/watch-later
 */
const express = require('express');
const watchLaterController = require('../controllers/watchLaterController');

const router = express.Router();

router.get('/:userId', watchLaterController.getWatchLaterByUserId);
router.post('/', watchLaterController.addWatchLater);
router.delete('/:id', watchLaterController.deleteWatchLater);

module.exports = router;
