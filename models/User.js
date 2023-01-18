const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// Создаем схему для таблицы users

const userSchema = new Schema({
    // Создаем поле с email юзера
    email: {
        type: String,
        required: true,
        unique: true
    },

    // Создаем поле паролем юзера
    password: {
        type: String,
        required: false,
    },


    name: {
        type: String,
        required: false,
    },

    secondName: {
        type: String,
        required: false,
    },

    thirdName: {
        type: String,
        required: false,
    },

    doverenost: {
        type: String,
        required: false,
    },

    doverenostDate: {
        type: String,
        required: false,
    },
});


// Создаем таблицу users
module.exports = mongoose.model('users', userSchema);