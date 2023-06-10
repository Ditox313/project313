const express = require('express');
const router = express.Router();
const passport = require('passport');
const controller = require('../controllers/bookings.js');
const upload = require('../middleware/upload');



// Роут на create
router.post('/', passport.authenticate('jwt', { session: false }), controller.create);

// Роут на fetch
router.get('/', passport.authenticate('jwt', { session: false }), controller.fetch);

// Роут на update
router.patch('/:id', passport.authenticate('jwt', { session: false }), controller.update);


// Роут на updateActClick
router.patch('/updateActClicked/:id', passport.authenticate('jwt', { session: false }), controller.updateActClicked);

// Роут на extend
router.patch('/extend/:id', passport.authenticate('jwt', { session: false }), controller.extend);

// Роут на close
router.patch('/close/:id', passport.authenticate('jwt', { session: false }), controller.close);


// Роут на getById
router.get('/:id', passport.authenticate('jwt', { session: false }), controller.getById);

// Роут на getStatusBooking
router.get('/:id', passport.authenticate('jwt', { session: false }), controller.getStatusBooking);


// // Роут на remove
router.delete('/:id', passport.authenticate('jwt', { session: false }), controller.remove);

// Роут на toggleStatus
router.post('/toggleStatus', passport.authenticate('jwt', { session: false }), controller.toggleStatus);


// Роут на toggleStatus
router.post('/toggleStatus', passport.authenticate('jwt', { session: false }), controller.toggleStatus);


// Роут на поиск
router.post('/search_client', passport.authenticate('jwt', { session: false }), controller.searchWidget);


// Создание логированный платеж в брони
router.patch('/update-after-booking-pay/:id', passport.authenticate('jwt', { session: false }), controller.update_after_booking_pay);


// Создание логированный акт в брони
router.patch('/update-after-booking-act/:id', passport.authenticate('jwt', { session: false }), controller.update_after_booking_act);

module.exports = router;