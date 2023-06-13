const express = require('express');
const router = express.Router();
const passport = require('passport');
const controller = require('../controllers/smena.js');
const upload = require('../middleware/upload');



// Роут на create
router.post('/create', passport.authenticate('jwt', { session: false }), controller.create);

// Роут на fetch
router.get('/get-all', passport.authenticate('jwt', { session: false }), controller.fetch);

// Роут на getSmena
// router.get('/getSmena', passport.authenticate('jwt', { session: false }), controller.getSmena);

// // Роут на remove
router.delete('/remove/:id', passport.authenticate('jwt', { session: false }), controller.remove);



module.exports = router;