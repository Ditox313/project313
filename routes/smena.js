const express = require('express');
const router = express.Router();
const passport = require('passport');
const controller = require('../controllers/smena.js');
const upload = require('../middleware/upload');



// Роут на create
router.post('/create', passport.authenticate('jwt', { session: false }), controller.create);



// // Роут на получение всех платежей для брони
// router.get('/:id', passport.authenticate('jwt', { session: false }), controller.getPaysByBookingId);



module.exports = router;