const express = require('express');
const router = express.Router();
const passport = require('passport');
const controller = require('../controllers/cars.js');
const upload = require('../middleware/upload');



// Роут на create
router.post('/', passport.authenticate('jwt', { session: false }), upload.single('previewSrc'), controller.create);

// Роут на fetch
router.get('/', passport.authenticate('jwt', { session: false }), controller.fetch);

// Роут на update
router.patch('/update/:id', passport.authenticate('jwt', { session: false }), upload.single('previewSrc'), controller.update);

// Роут на закрытие
router.patch('/close/:id', passport.authenticate('jwt', { session: false }), controller.close);


// Роут на getById
router.get('/:id', passport.authenticate('jwt', { session: false }), controller.getById);


// // Роут на remove
router.delete('/:id', passport.authenticate('jwt', { session: false }), controller.remove);

module.exports = router;