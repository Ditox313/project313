const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// Создаем схему для таблицы settings

const settingsSchema = new Schema({
    share_avto:
    {
        type: Object,
        required: false,
    },

    washing_avto:
    {
        type: Object,
        required: false,
    },

    additionally_avto:
    {
        type: Object,
        required: false,
    },
    userId:
    {
        type: String,
        required: false,
    }
});


// Создаем таблицу settings
module.exports = mongoose.model('settings', settingsSchema);