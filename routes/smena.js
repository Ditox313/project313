const express = require('express');
const router = express.Router();
const passport = require('passport');
const controller = require('../controllers/smena.js');
const upload = require('../middleware/upload');



// Роут на create
router.post('/create', passport.authenticate('jwt', { session: false }), controller.create);

// Роут на fetch
router.get('/get-all', passport.authenticate('jwt', { session: false }), controller.fetch);


// Роут на getById
router.get('/:id', passport.authenticate('jwt', { session: false }), controller.getById);

// // Роут на remove
router.delete('/remove/:id', passport.authenticate('jwt', { session: false }), controller.remove);

// // Роут на close
router.patch('/close/:id', passport.authenticate('jwt', { session: false }), controller.close);



module.exports = router;