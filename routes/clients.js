const express = require('express');
const router = express.Router();
const passport = require('passport');
const controller = require('../controllers/clients.js');
const upload_2 = require('../middleware/upload_2');



// Роут на create физ/лицо
router.post('/', passport.authenticate('jwt', { session: false }), upload_2.fields([{name: 'passport_1_img'},{name: 'passport_2_img'},{name: 'prava_1_img'},{name: 'prava_2_img'}]), controller.create);

// Роут на create юр/лицо
router.post('/create_law_fase/', passport.authenticate('jwt', { session: false }), upload_2.fields([{ name: 'doc_1_img' }, { name: 'doc_2_img' }, { name: 'doc_3_img' }, { name: 'doc_4_img' }]), controller.create_law_fase);

// Роут на fetch
router.get('/', passport.authenticate('jwt', { session: false }), controller.fetch);

// Роут на fetch law_fase clients
router.get('/law_fase_clients/', passport.authenticate('jwt', { session: false }), controller.fetch_lawfase);

// get_all
router.get('/all', passport.authenticate('jwt', { session: false }), controller.get_all);

// get all law face
router.get('/all-lawface', passport.authenticate('jwt', { session: false }), controller.get_all_law_face);

// // Роут на update физ/лиц
router.patch('/update/:id',passport.authenticate('jwt', { session: false }), upload_2.fields([{name: 'passport_1_img'},{name: 'passport_2_img'},{name: 'prava_1_img'},{name: 'prava_2_img'}]), controller.update);


// // Роут на update юр/лиц
router.patch('/update_lawfase/:id', passport.authenticate('jwt', { session: false }), upload_2.fields([{ name: 'doc_1_img' }, { name: 'doc_2_img' }, { name: 'doc_3_img' }, { name: 'doc_4_img' }]), controller.update_lawfase);

// // Роут на getById для Физ/лиц
router.get('/:id', passport.authenticate('jwt', { session: false }), controller.getById);

// // Роут на getById для Юр/лиц
router.get('/lawfase_by_id/:id', passport.authenticate('jwt', { session: false }), controller.getById_lawfase);

// Роут на remove для физ/лиц
router.delete('/:id', passport.authenticate('jwt', { session: false }), controller.remove);


// Роут на remove для Юр/лиц
router.delete('/delete_lawfase/:id', passport.authenticate('jwt', { session: false }), controller.remove_lawwfase);

module.exports = router;