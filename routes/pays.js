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

// // Роут на получение всех платежей по id смены
router.get('/get-all-by-smenaId/:id', passport.authenticate('jwt', { session: false }), controller.getPaysBySmenaId);



module.exports = router;

