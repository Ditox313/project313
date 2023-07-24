const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// Создаем схему для таблицы cars

const bookingSchema = new Schema({


    user: {
        ref: 'users',
        type: Schema.Types.ObjectId
    },

    // Дата создания
    date: {
        type: Date,
        default: Date.now,
    },



    // Автомобиль
    car: {
        type: Object,
        required: true,
    },

    // Клиент
    client: {
        type: Object,
        required: true,
    },

    // Продления
    extend: {
        type: Array,
        required: false,
    },

    // Начало брони
    booking_start: {
        type: String,
        default: '',
        required: true,
    },

    // Конец брони
    booking_end: {
        type: String,
        default: '',
        required: true,
    },


    booking_days: {
        type: String,
        default: '',
        required: true,
    },


    // Место выдачи
    place_start: {
        type: String,
        default: '',
        required: true,
    },


    // Место сдачи
    place_end: {
        type: String,
        default: '',
        required: true,
    },

    // Тариф
    tariff: {
        type: Array,
        default: '',
        required: true,
    },


    // Сумма брони аренды
    summa: {
        type: Number,
        default: '',
        required: true,
    },

    // Сумма брони общая
    summaFull: {
        type: String,
        default: '',
        required: true,
    },


    // Сумма брони общая
    dop_hours: {
        type: Number,
        default: 0,
        required: true,
    },

    // Комментарий
    comment: {
        type: String,
        default: '',
        required: false,
    },

    // Порядковый номер
    order: {
        type: Number,
        required: true,
    },

    // Статус
    status: {
        type: String,
        default: 'В ожидании',
        required: true,
    },

    // Сколько оплачено
    paidCount: {
        type: Number,
        default: 0,
        required: false,
    },

    // Скидка
    sale: {
        type: Number,
        default: 0,
        required: false,
    },


    // Дополнительная информация при открытии брони
    dop_info_open: {
        type: Object,
        required: false,
    },


    // Информация по обновлениям
    updates: {
        type: Array,
        required: false,
    },

    // Дополнительная информация при закрытии брони
    dop_info_close: {
        type: Object,
        required: false,
    },


    // Залог для брони
    booking_zalog: {
        type: Number,
        default: 0,
        required: false,
    },

    dogovor_number__actual: {
        type: String,
        default: '',
        required: false,
    },


    // Жизненный цикл брони
    booking_life_cycle: {
        type: Array,
        required: false,
    },

    // Id смены
    smenaId: {
        type: Schema.Types.ObjectId,
        required: false,
    },

});


// Создаем таблицу cars
module.exports = mongoose.model('bookings', bookingSchema);