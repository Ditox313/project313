const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// Создаем схему для таблицы pays

const paySchema = new Schema({

    // Юзер
    userId: {
        type: String,
        required: true,
    },

    // Дата создания
    date: {
        type: Date,
        default: Date.now,
    },



    // Вид платежа
    vidPay: {
        type: String,
        required: true,
    },

    // Тип платежа
    typePay: {
        type: String,
        required: true,
    },


    pricePay: {
        type: Number,
        required: true,
    },

    // Бронь ID
    bookingId: {
        type: String,
        required: true,
    },

    order: {
        type: Number,
        required: true,
        default: 1
    },

    smenaId: {
        type: String,
        required: true,
        default: 1
    },



});


// Создаем таблицу cars
module.exports = mongoose.model('pays', paySchema);