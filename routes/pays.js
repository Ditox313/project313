const express = require('express');
const router = express.Router();
const passport = require('passport');
const controller = require('../controllers/pays.js');
const upload = require('../middleware/upload');



// Роут на create
router.post('/', passport.authenticate('jwt', { session: false }), controller.create);

// Роут на vozvrat_zaloga
router.post('/vozvrat_zaloga', passport.authenticate('jwt', { session: false }), controller.vozvrat_zaloga);

// // Роут на получение всех платежей для брони
router.get('/:id', passport.authenticate('jwt', { session: false }), controller.getPaysByBookingId);

// Роут на update
// router.patch('/:id', passport.authenticate('jwt', { session: false }), controller.update);


// Роут на getById
// router.get('/:id', passport.authenticate('jwt', { session: false }), controller.getById);

// // Роут на getStatusBooking
// router.get('/:id', passport.authenticate('jwt', { session: false }), controller.getStatusBooking);


// // Роут на remove
// router.delete('/:id', passport.authenticate('jwt', { session: false }), controller.remove);

// Роут на toggleStatus
// router.post('/toggleStatus', passport.authenticate('jwt', { session: false }), controller.toggleStatus);

module.exports = router;