const express = require('express');
const router = express.Router();
const controller = require('../controllers/settings.js');
const passport = require('passport');


// Роут на create
router.post('/create_settings', passport.authenticate('jwt', { session: false }), controller.createSettings);



// Роут на save_settings
router.patch('/save_settings', passport.authenticate('jwt', { session: false }), controller.updateSettings);


// Роут на get_settings_user
router.get('/get_settings_user/:id', passport.authenticate('jwt', { session: false }), controller.getSettingsUser);




module.exports = router;