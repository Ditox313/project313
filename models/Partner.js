const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// Создаем схему для таблицы partner

const partnerSchema = new Schema({

    // Имя
    name: {
        type: String,
        default: '',
        required: true,
    },

    // Фамилия
    surname: {
        type: String,
        default: '',
        required: true,
    },

    // Отчество
    lastname: {
        type: String,
        default: '',
        required: true,
    },

    // Серия паспорта
    passport_seria: {
        type: String,
        default: '',
        required: true,
    },

    // Номер паспорта
    passport_number: {
        type: String,
        default: '',
        required: true,
    },

    // Дата выдачи паспорта
    passport_date: {
        type: String,
        default: '',
        required: false,
    },

    // Кем выдан пасспорт
    passport_who_take: {
        type: String,
        default: '',
        required: true,
    },

    // Код подразделения
    code_podrazdeleniya: {
        type: String,
        default: '',
        required: true,
    },


    // Код регистрация
    passport_register: {
        type: String,
        default: '',
        required: true,
    },

    

    // Основной номер телефона
    phone_main: {
        type: String,
        default: '',
        required: true,
    },

    // Дополнительный телефон №1 - имя
    phone_1_dop_name: {
        type: String,
        default: '',
        required: false,
    },

    // Дополнительный телефон №1 - номер
    phone_1_dop_number: {
        type: String,
        default: '',
        required: false,
    },


     // Дополнительный телефон №2 - имя
    phone_2_dop_name: {
        type: String,
        default: '',
        required: false,
    },

    // Дополнительный телефон №2 - номер
    phone_2_dop_number: {
        type: String,
        default: '',
        required: false,
    },



    // Пасспорт 1 страница
    passport_1_img: {
        type: String,
        default: '',
        required: true,
    },

    // Пасспорт 2 страница
    passport_2_img: {
        type: String,
        default: '',
        required: true,
    },



    // Пользователь который создал партнера
    user: {
        type: String,
        default: '',
        required: true,
    },

    // Дата создания
    date: {
        type: Date,
        default: Date.now,
    },
});


// Создаем таблицу partners
module.exports = mongoose.model('partners', partnerSchema);