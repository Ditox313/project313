const express = require('express');
const router = express.Router();
const passport = require('passport');
const controller = require('../controllers/partners.js');
const upload_2 = require('../middleware/upload_2');



// Роут на create
router.post('/', passport.authenticate('jwt', { session: false }), upload_2.fields([{name: 'passport_1_img'},{name: 'passport_2_img'}]), controller.create);

// Роут на fetch
router.get('/', passport.authenticate('jwt', { session: false }), controller.fetch);

// get_all
router.get('/all', passport.authenticate('jwt', { session: false }), controller.get_all);

// // Роут на update
router.patch('/update/:id',passport.authenticate('jwt', { session: false }), upload_2.fields([{name: 'passport_1_img'},{name: 'passport_2_img'},{name: 'prava_1_img'},{name: 'prava_2_img'}]), controller.update);


// // Роут на getById
router.get('/:id', passport.authenticate('jwt', { session: false }), controller.getById);


// // Роут на remove
router.delete('/:id', passport.authenticate('jwt', { session: false }), controller.remove);

module.exports = router;