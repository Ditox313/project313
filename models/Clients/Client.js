const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// Создаем схему для таблицы clients

const clientSchema = new Schema({

    // Тип клиента
    type: {
        type: String,
        default: 'fiz',
        required: true,
    },

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

    // Отчество
    makedate: {
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

    // Регистрация
    passport_register: {
        type: String,
        default: '',
        required: true,
    },

    // Адрес фактического проживания
    passport_address_fact: {
        type: String,
        default: '',
        required: false,
    },

    // Серия водительского удостоверения
    prava_seria: {
        type: String,
        default: '',
        required: true,
    },

    // Номер водительского удостоверения
    prava_number: {
        type: String,
        default: '',
        required: true,
    },

    // Дата выдачи водительского удостоверения
    prava_date: {
        type: String,
        default: '',
        required: false,
    },

    // Дата выдачи водительского удостоверения
    prava_date: {
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


    // Дополнительный телефон №3 - имя
    phone_3_dop_name: {
        type: String,
        default: '',
        required: false,
    },

    // Дополнительный телефон №3 - номер
    phone_3_dop_number: {
        type: String,
        default: '',
        required: false,
    },

    // Дополнительный телефон №4 - имя
    phone_4_dop_name: {
        type: String,
        default: '',
        required: false,
    },

    // Дополнительный телефон №4 - номер
    phone_4_dop_number: {
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

    // Пасспорт 1 страница
    passport_2_img: {
        type: String,
        default: '',
        required: true,
    },

    // Права 1 страница
    prava_1_img: {
        type: String,
        default: '',
        required: true,
    },

    // Права 2 страница
    prava_2_img: {
        type: String,
        default: '',
        required: true,
    },

    order: {
        type: Number,
        default: 0,
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


// Создаем таблицу clients
module.exports = mongoose.model('clients', clientSchema);