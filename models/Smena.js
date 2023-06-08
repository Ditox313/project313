const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// Создаем схему для таблицы Smena

const smenaSchema = new Schema({

    userId: {
        type: String,
        required: true,
    },

    
    date: {
        type: Date,
        default: Date.now,
    },

    open_date: {
        type: String,
        required: true,
    },


    open_date_time: {
        type: String,
        required: true,
    },


    responsible: {
        type: String,
        required: true,
    },


    status: {
        type: String,
        required: true,
    },


    close_date: {
        type: String,
        required: false,
    },


    close_date_time: {
        type: String,
        required: false,
    },

    order: {
        type: Number,
        required: true,
    },


});


// Создаем таблицу cars
module.exports = mongoose.model('smenas', smenaSchema);